import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ScheduleService } from "src/schedule/schedule.service";
import { User } from "src/user/user.model";
import { UserService } from "src/user/user.service";
import { CreateAppointmentDto, UpdateAppointmentDto } from "./appointment.dto";
import { AppointmentRepository } from "./appointment.repository";

@Injectable()
export class AppointmentService {
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly userService: UserService,
        private readonly scheduleService: ScheduleService,
        private mailerService: MailerService
    ) { }

    private formatUtcDate(date: Date): any {
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1; // months are zero-based
        const year = date.getUTCFullYear();
    
        const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    
        return {formattedTime, formattedDate};
    }

    async createAppointment(mentee: User, dto: CreateAppointmentDto) {      
        const schedule = await this.scheduleService.getScheduleById(dto.schedule)

        if(!schedule) throw new HttpException('Schedule with the provided ID does not exist', HttpStatus.BAD_REQUEST);
        if(!schedule.status) throw new HttpException('Schedule is already taken', HttpStatus.BAD_REQUEST);
        if(schedule.deleted) throw new HttpException('Schedule is already deleted', HttpStatus.BAD_REQUEST);

        dto.mentee = mentee._id;
        dto.mentor = schedule.user._id;
        dto.status = "pending";

        const newAppointment = await this.appointmentRepository.create(dto);
        await newAppointment.populate({ path: 'mentee', select: 'name avatar email' });
        await newAppointment.populate({ path: 'mentor', select: 'name avatar email expertise',populate: { path: 'expertise',select: 'name'}});
        await newAppointment.populate({ path: 'schedule' });

        // change schedule status to false
        await this.scheduleService.updateScheduleStatus(dto.schedule, false)

        // notify mail
        await this.mailerService.sendMail({
            to: newAppointment.mentor.email,
            subject: 'You have a new pending appointment!',
            template: `./bookappointment`,
            context: {
                mentee: newAppointment.mentee.name,
                mentor: newAppointment.mentor.name,
                start_at: this.formatUtcDate(newAppointment.schedule.start_at).formattedTime,
                end_at: this.formatUtcDate(newAppointment.schedule.end_at).formattedTime,
                date: this.formatUtcDate(newAppointment.schedule.end_at).formattedDate,
                note: newAppointment.note,
                expertise: newAppointment.mentor.expertise.name
            }
        })
        
        return newAppointment
    }

    // legacy function
    async getAllUsersAppointments(userId: string, page:number, limit:number = 6) {
        const count = await this.appointmentRepository.countDocuments({$or: [{ mentee: userId }, { mentor: userId }]})
        const countPage = Math.ceil(count / limit)
        const skip = (page - 1) * limit || 0
        const tempAppointments = await this.appointmentRepository.getByCondition({$or: [{ mentee: userId }, { mentor: userId }]})

        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() +7);

        // update status on expired appointments (based on schedule date)
        await Promise.all(tempAppointments.map(async (appointment) => {
            await appointment.populate({ path: 'schedule' });
            if (appointment.schedule.start_at < currentDate) {
                if (appointment.status === "pending") {
                    await this.appointmentRepository.findByIdAndUpdate(appointment.id, { status: "canceled" })
                }
            }
            if (appointment.schedule.start_at < currentDate) {
                if (appointment.status === "confirmed") {
                    await this.appointmentRepository.findByIdAndUpdate(appointment.id, { status: "finished" })
                }
            }
        }));

        const appointments = await this.appointmentRepository.aggregate([
            {
                $match: {
                    $or: [{ mentee: userId }, { mentor: userId }]
                },
            },
            {
                $lookup: {
                    from: 'schedules',
                    localField: 'schedule',
                    foreignField: '_id',
                    as: 'schedule'
                }
            }, 
            {
                $unwind: '$schedule'
            },
            {
                $sort: {
                    'schedule.start_at': 1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: Number(limit)
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'mentee',
                    foreignField: '_id',
                    as: 'mentee'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'mentor',
                    foreignField: '_id',
                    as: 'mentor'
                }
            },
            {
                $unwind: '$mentee'
            },
            {
                $unwind: '$mentor'
            },
            {
                $lookup: {
                    from: 'expertises', 
                    localField: 'mentor.expertise',
                    foreignField: '_id',
                    as: 'mentor.expertise'
                }
            },
            {
                $unwind: '$mentor.expertise'
            },
            {
                $project: {
                    _id: 1,
                    schedule: 1,
                    mentee: {
                        name: '$mentee.name',
                        avatar: '$mentee.avatar',
                        email: '$mentee.email'
                    },
                    mentor: {
                        name: '$mentor.name',
                        avatar: '$mentor.avatar',
                        skype_link: '$mentor.skype_link',
                        facebook_link: '$mentor.facebook_link',
                        expertise: {
                            name: '$mentor.expertise.name'
                        }
                    },
                    note: '$note',
                    status: '$status'
                }
            },
        ])

        return {
            count, countPage, appointments
        }
    }

    async getAppointmentById(user: User, id: string) {
        const appointment = await this.appointmentRepository.findById(id);
        if (appointment.mentee.equals(user._id) || appointment.mentor.equals(user._id) || user.role === 'admin' ) {
            await appointment.populate({ path: 'mentee', select: 'name avatar' });
            await appointment.populate({ path: 'mentor', select: 'name avatar skype_link facebook_link expertise',populate: {path: 'expertise',select: 'name'}, });
            await appointment.populate({ path: 'schedule' });
            return appointment
        } else {
            throw new HttpException('Only participants can view this appointment', HttpStatus.BAD_REQUEST);
        }
    }

    // legacy function
    async updateAppointment(mentor: User, id: string, appointment: UpdateAppointmentDto) {
        if (await this.userService.checkMentor(mentor._id)) {
            const oldAppointment = await this.appointmentRepository.findById(id)
            const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(id, appointment)
            await updatedAppointment.populate({ path: 'mentee', select: '-password -refreshToken -date_of_birth' });
            await updatedAppointment.populate({ path: 'mentor', select: '-password -refreshToken -date_of_birth' });
            await updatedAppointment.populate({ path: 'schedule' });

            // free up schedule
            if (appointment.status === "canceled") {
                await this.scheduleService.updateScheduleStatus(oldAppointment.schedule.id, true)
            }

            if (appointment.status === "confirmed") {
                await this.userService.updateUserNumberOfMentees(mentor._id);
            }
            return updatedAppointment;

        }
        else {
            throw new HttpException('Only mentors can modify an appointment', HttpStatus.BAD_REQUEST);
        }
    }

    async updateRatedAppointment(id: string, newStatus: string) {
        return await this.appointmentRepository.findByIdAndUpdate(id, {
            status: newStatus
        })
    }

    // confirm - mentor
    async confirmAppointment(mentor: User, id: string) {
        const tempAppointment = await this.appointmentRepository.findById(id)
        if (tempAppointment.status !== "pending") throw new HttpException('Status must be pending', HttpStatus.BAD_REQUEST);
        if (tempAppointment.mentor != mentor.id && mentor.role !== 'admin') throw new HttpException('No Permission', HttpStatus.UNAUTHORIZED);

        const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(id, {status: "confirmed"})
        await updatedAppointment.populate({ path: 'mentee', select: 'name avatar email' });
        await updatedAppointment.populate({ path: 'mentor', select: 'name avatar email skype_link facebook_link expertise',populate: {path: 'expertise',select: 'name'}, });
        await updatedAppointment.populate({ path: 'schedule' });

        // mail to mentee
        await this.mailerService.sendMail({
            to: updatedAppointment.mentee.email,
            subject: 'A mentor has confirmed your appointment!',
            template: `./confirmappointment`,
            context: {
                mentee: updatedAppointment.mentee.name,
                mentor: updatedAppointment.mentor.name,
                start_at: this.formatUtcDate(updatedAppointment.schedule.start_at).formattedTime,
                end_at: this.formatUtcDate(updatedAppointment.schedule.end_at).formattedTime,
                date: this.formatUtcDate(updatedAppointment.schedule.end_at).formattedDate,
                note: updatedAppointment.note,
                link: updatedAppointment.mentor.skype_link,
                expertise: updatedAppointment.mentor.expertise.name
            }
        })
        return updatedAppointment;
    } 

    // cancel - mentee
    async cancelAppointment(user: User, id: string) {
        const tempAppointment = await this.appointmentRepository.findById(id)
        if (tempAppointment.status !== "pending") throw new HttpException('Status must be pending', HttpStatus.BAD_REQUEST);
        if (tempAppointment.mentee != user.id && tempAppointment.mentor != user.id && user.role !== 'admin') throw new HttpException('No Permission', HttpStatus.UNAUTHORIZED);

        const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(id, {
            status: "canceled"
        })

        await updatedAppointment.populate({ path: 'mentee', select: 'name avatar email' });
        await updatedAppointment.populate({ path: 'mentor', select: 'name avatar email skype_link facebook_link expertise',populate: {path: 'expertise',select: 'name'}, });
        await updatedAppointment.populate({ path: 'schedule' });
        
        // free up schedule
        await this.scheduleService.updateScheduleStatus(tempAppointment.schedule._id, true)

        // mail to the other
        if(updatedAppointment.mentee._id.toString() == (user.id.toString())) return updatedAppointment;
        
        await this.mailerService.sendMail({
            to: updatedAppointment.mentee.email,
            subject: 'An appointment has been canceled!',
            template: `./cancelappointment`,
            context: {
                mentee: updatedAppointment.mentee.name,
                mentor: updatedAppointment.mentor.name,
                start_at: this.formatUtcDate(updatedAppointment.schedule.start_at).formattedTime,
                end_at: this.formatUtcDate(updatedAppointment.schedule.end_at).formattedTime,
                date: this.formatUtcDate(updatedAppointment.schedule.end_at).formattedDate,
                note: updatedAppointment.note,
                expertise: updatedAppointment.mentor.expertise.name
            }
        })

        return updatedAppointment;
    }

    // Legacy function
    async finishAppointment(mentor: User, id: string) {
        const oldAppointment = await this.appointmentRepository.findById(id)
        if (oldAppointment.status !== "confirmed") throw new HttpException('Status must be confirmed', HttpStatus.BAD_REQUEST);

        // if (!(await this.userService.checkMentor(mentor._id))) throw new HttpException('Only mentors can finish an appointment', HttpStatus.BAD_REQUEST);
        const updatedAppointment = await this.appointmentRepository.findByIdAndUpdate(id, {
            status: "finished"
        })
        await updatedAppointment.populate({ path: 'mentee', select: '-password -refreshToken -date_of_birth' });
        await updatedAppointment.populate({ path: 'mentor', select: '-password -refreshToken -date_of_birth' });
        await updatedAppointment.populate({ path: 'schedule' });

        // update number of mentee
        await this.userService.updateUserNumberOfMentees(mentor._id);
        // mail

        return updatedAppointment;
    }

    async getAllUsersStatusAppointments(user_id: string, page:number, limit:number = 6, status: string) {
        const count = await this.appointmentRepository.countDocuments(
            {
                $or: [{ mentee: user_id }, { mentor: user_id }],
                status: status
            }
        )
        const countPage = Math.ceil(count / limit)
        const skip = (page - 1) * limit || 0
        const tempAppointments = await this.appointmentRepository.getByCondition({$or: [{ mentee: user_id }, { mentor: user_id }]})

        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() +7);
        
        // update expired appointments based on their schedules (pass current date)
        await Promise.all(tempAppointments.map(async (appointment) => {
            await appointment.populate({ path: 'schedule' });
            if (appointment.schedule.start_at < currentDate) {
                if (appointment.status === "pending") {
                    await this.appointmentRepository.findByIdAndUpdate(appointment.id, { status: "canceled" })
                }
            }
            if (appointment.schedule.start_at < currentDate) {
                if (appointment.status === "confirmed") {
                    await this.appointmentRepository.findByIdAndUpdate(appointment.id, { status: "finished" })
                }
            }
        }));
        
        const appointments = await this.appointmentRepository.aggregate([
            {
                $match: {
                    $or: [{ mentee: user_id }, { mentor: user_id }],
                    status: status
                },
            },
            {
                $lookup: {
                    from: 'schedules',
                    localField: 'schedule',
                    foreignField: '_id',
                    as: 'schedule'
                }
            }, 
            {
                $unwind: '$schedule'
            },
            {
                $sort: {
                    'schedule.start_at': 1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: Number(limit)
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'mentee',
                    foreignField: '_id',
                    as: 'mentee'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'mentor',
                    foreignField: '_id',
                    as: 'mentor'
                }
            },
            {
                $unwind: '$mentee'
            },
            {
                $unwind: '$mentor'
            },
            {
                $lookup: {
                    from: 'expertises', 
                    localField: 'mentor.expertise',
                    foreignField: '_id',
                    as: 'mentor.expertise'
                }
            },
            {
                $unwind: '$mentor.expertise'
            },
            {
                $project: {
                    _id: 1,
                    schedule: 1,
                    mentee: {
                        name: '$mentee.name',
                        avatar: '$mentee.avatar',
                        email: '$mentee.email'
                    },
                    mentor: {
                        name: '$mentor.name',
                        avatar: '$mentor.avatar',
                        skype_link: '$mentor.skype_link',
                        facebook_link: '$mentor.facebook_link',
                        expertise: {
                            name: '$mentor.expertise.name'
                        }
                    },
                    note: '$note',
                    status: '$status'
                }
            },
        ])

        return {
            count, countPage, appointments
        }
    }

    // Admin access
    async getAllAppointments(page:number, limit:number = 6, status: string) {
        let query = null;
        if(status) query = {status: status}
        const count = await this.appointmentRepository.countDocuments(query)
        const countPage = Math.ceil(count / limit)
        const appointments = await this.appointmentRepository.getByCondition(
            query,
            null,
            {
                sort: {
                    createdAt: -1,
                },
                skip: (page - 1) * limit,
                limit: limit
            },
            [
                { path: 'mentor', select: 'name avatar email phone gender skype_link facebook_link', populate: { path: 'expertise', select: 'name' }},
                { path: 'mentee', select: 'name avatar email phone gender'},
                { path: 'schedule'}
            ]
        )

        return {
            count, countPage, appointments
        }
    }
}
