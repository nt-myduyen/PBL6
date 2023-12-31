import { IsEmail, IsIn, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { IsStrongPassword } from "../validators/password.validator";

export class CreateUserDto {
    @IsNotEmpty() name: string;
    @IsEmail() @IsNotEmpty() email: string;
    @MinLength(6) @IsNotEmpty() @MaxLength(20) password: string;
    @IsNotEmpty() date_of_birth: Date;
    @IsNotEmpty() gender: boolean;
    @IsIn(['mentor', 'mentee']) @IsNotEmpty() role: string;  
    phone: string;
    avatar: string;
    number_of_mentees: number;
    facebook_link: string;
    skype_link: string;
    expertise: string;
}

export class LoginUserDto {
    @IsEmail() @IsNotEmpty() email: string;
    @IsNotEmpty() @IsStrongPassword() password: string;
}

export class UpdateUserDto {
    name: string;
    date_of_birth: Date;
    avatar: string;
    phone: string;
    gender: boolean;
    facebook_link: string;
    skype_link: string;
    expertise: string;
}

export class PaginationUserDto {
    page: number;
    limit: number;
}
