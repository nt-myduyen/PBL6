<template>
  <div
    class="appointment-card bg-slate-50 w-fit relative p-3 rounded-lg border hover:shadow-md min-w-[300px] my-2 cursor-pointer"
    @click="onClick"
  >
    <div class="appointment-card__header">
      <div class="appointment-card__header">
        <div class="appointment-card__header__title">
          <h4 class="font-bold text-xl">Lịch hẹn tư vấn nghề nghiệp</h4>
          <p class="text-gray-500 text-md">
            {{ formatDate(appointment?.schedule?.start_at, "DD/MM/YYYY") }}
          </p>
          <div
            class="appointment-card__header__status bg-yellow-500 w-fit px-2 rounded absolute right-3 top-12"
          >
            <span class="text-white text-sm">{{
              appointment?.status || ""
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="appointment-card__body mt-3">
      <div
        class="appointment-card__body__top flex flex-col items-center text-center"
      >
        <div class="appointment-card__avatar">
          <img
            :src="
              getUserInfo().role == 'mentee'
                ? handleImage(appointment?.mentor?.avatar)
                : handleImage(appointment?.mentee?.avatar)
            "
            alt="avatar"
            class="w-20 h-20 rounded-full object-cover"
          />
        </div>
        <div class="appointment-card__body__top__info mt-2">
          <h4 class="font-bold text-xl m-0">
            {{
              getUserInfo().role == "mentee"
                ? appointment?.mentor.name || ""
                : appointment?.mentee.name || ""
            }}
          </h4>
          <p class="text-gray-500 m-0">Chuyên gia tư vấn nghề nghiệp</p>
        </div>
      </div>
      <div class="appointment-card__body__bottom mt-3 flex">
        <div class="appointment-card__body__bottom__time w-2/3">
          <p class="text-gray-500 my-1">Thời gian</p>
          <p class="font-bold m-0">
            {{
              `${formatDate(
                appointment?.schedule?.start_at.slice(0, -1),
                "HH:mm"
              )}-${formatDate(
                appointment?.schedule?.end_at.slice(0, -1),
                "HH:mm"
              )}`
            }}
          </p>
        </div>
        <div class="appointment-card__body__bottom__time w-1/3">
          <p class="text-gray-500 my-1">Địa điểm</p>
          <p class="font-bold">Online</p>
        </div>
      </div>
      <div
        class="appointment-card__action d-flex align-items-center justify-content-between"
      >
        <div
          class="appointment-card__cancel"
          v-if="appointment.status == 'pending'"
        >
          <button class="btn btn-danger !text-sm" @click="onCancelAppointment">
            Hủy lịch hẹn<span
              v-if="isLoadingCancel"
              className="spinner-border spinner-border-sm ms-2"
              role="status"
              aria-hidden="true"
            ></span>
          </button>
        </div>
        <div
          class="appointment-card__confirm"
          v-if="
            appointment.status == 'pending' && getUserInfo().role == 'mentor'
          "
        >
          <button
            class="btn btn-primary !text-sm"
            @click="onConfirmAppointment"
          >
            Xác nhận lịch hẹn
            <span
              v-if="isLoadingConfirm"
              className="spinner-border spinner-border-sm ms-2"
              role="status"
              aria-hidden="true"
            ></span>
          </button>
        </div>
        <!-- <div
          class="appointment-card__finish"
          @click=""
          v-if="appointment.status == 'confirmed'"
        >
          <button class="btn btn-primary !text-sm">Hoàn tất</button>
        </div> -->
      </div>
    </div>
  </div>
  <ConfirmModal
    ref="confirmModal"
    :appointment="appointment"
    @cancel="cancelAppointment"
    @confirm="confirmAppointment"
  />
</template>
<script lang="ts" src="./Appointment.ts"></script>
<style scoped lang="css" src="./style.css"></style>
