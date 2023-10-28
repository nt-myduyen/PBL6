import { get, noop } from "lodash";
import { defineStore } from "pinia";
import { getAllUserAppointment, createAppointment, confirmAppointment } from "./../api/appointment";
import { CreateAppointmentParams } from "../types/appointment.js";

export const useAppointment = defineStore("appointment", () => {
  const requestGetAllUserAppointment = async ({
    callback,
  }: {
    callback: App.Callback;
  }): Promise<void> => {
    const onSuccess = get(callback, "onSuccess", noop);
    const onFailure = get(callback, "onFailure", noop);
    const onFinish = get(callback, "onFinish", noop);

    try {
      const response = await getAllUserAppointment();
      onSuccess(response);
    } catch (error) {
      onFailure(error);
    } finally {
      onFinish();
    }
  };

  const requestCreateAppointment = async ({
    params,
    callback,
  }: {
    params: CreateAppointmentParams;
    callback: App.Callback;
  }): Promise<void> => {
    const onSuccess = get(callback, "onSuccess", noop);
    const onFailure = get(callback, "onFailure", noop);
    const onFinish = get(callback, "onFinish", noop);

    try {
      const response = await createAppointment(params);
      onSuccess(response);
    } catch (error) {
      onFailure(error);
    } finally {
      onFinish();
    }
  }

  const requestConfirmAppointment = async ({
    id,
    callback,
  }: {
    id: string;
    callback: App.Callback;
  }): Promise<void> => {
    const onSuccess = get(callback, "onSuccess", noop);
    const onFailure = get(callback, "onFailure", noop);
    const onFinish = get(callback, "onFinish", noop);

    try {
      const response = await confirmAppointment(id);
      onSuccess(response);
    } catch (error) {
      onFailure(error);
    } finally {
      onFinish();
    }
  };

  return {
    requestGetAllUserAppointment,
    requestCreateAppointment,
    requestConfirmAppointment,
  };
});
