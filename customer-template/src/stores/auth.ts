import { get, noop } from "lodash";
import { SignInParams, SignUpParams } from "../types/auth.js";
import { signIn, signUp } from "../api/auth.js";
import { defineStore } from "pinia";
import {
  getAccessToken,
  revokeUser,
  setAccessToken,
  setRefreshToken,
  setUserInfo,
  getUserInfo,
} from "../ultils/cache/cookies.js";
import router from "../router";
import { RouterNameEnum } from "../constants/routeName";
import { Authorization } from "../types/auth.js";
import { ref } from "vue";
import { User } from "../types/auth.js";

export const useAuth = defineStore("auth", () => {
  const userInfo = ref<User | null>(getUserInfo() || null);

  const setUserInfoStore = (info: User | null) => {
    userInfo.value = info;
  };

  const getToken = () => {
    return getAccessToken();
  };

  const isLoggedIn = () => {
    return getToken() ? true : false;
  };

  const logout = () => {
    revokeUser();
    setUserInfoStore(null);
    router.push({ name: RouterNameEnum.SignIn });
  };

  const requestSignIn = async ({
    params,
    callback,
  }: {
    params: SignInParams;
    callback: App.Callback;
  }): Promise<void> => {
    const onSuccess = get(callback, "onSuccess", noop);
    const onFailure = get(callback, "onFailure", noop);
    const onFinish = get(callback, "onFinish", noop);

    try {
      const response = await signIn(params);
      signInSuccess(response);
      onSuccess(response);
    } catch (error) {
      onFailure(error);
    } finally {
      onFinish();
    }
  };

  const signInSuccess = (res: Authorization) => {
    setUserInfoStore(res);
    setAccessToken(res.accessToken);
    setRefreshToken(res.refreshToken);
    setUserInfo(res);
  };

  const requestSignUp = async ({
    params,
    callback,
  }: {
    params: SignUpParams;
    callback: App.Callback;
  }): Promise<void> => {
    const onSuccess = get(callback, "onSuccess", noop);
    const onFailure = get(callback, "onFailure", noop);
    const onFinish = get(callback, "onFinish", noop);

    try {
      const response = await signUp(params);
      signInSuccess(response);
      onSuccess(response);
    } catch (error) {
      onFailure(error);
    } finally {
      onFinish();
    }
  };

  return {
    requestSignIn,
    requestSignUp,
    getToken,
    isLoggedIn,
    logout,
    userInfo,
  };
});