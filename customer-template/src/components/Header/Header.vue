<template>
  <header class="header d-flex align-items-center">
    <div class="container">
      <nav
        class="position-relative px-4 py-4 d-flex justify-content-between align-items-center"
      >
        <router-link to="/" class="flex items-center">
          <img :src="logo" alt="Logo" width="60" height="60" class="mb-2" />
          <span class="text-white text-xl font-bold">IT MENTOR</span>
        </router-link>

        <ul
          class="d-none ms-lg-auto d-lg-flex align-items-lg-center w-lg-auto gap-4 mb-lg-0"
        >
          <li v-for="item in navLinks" :key="item.path" class="list-style-none">
            <router-link :to="item.path" class="router-link">
              {{ item.name }}
            </router-link>
          </li>
        </ul>

        <ul
          v-if="isLogin"
          class="ms-auto ms-lg-0 d-flex align-items-center w-auto gap-4 mb-0"
        >
          <li>
            <el-tooltip
              class="box-item"
              effect="light"
              content="Lịch hẹn của tôi"
              placement="bottom"
            >
              <router-link to="/appointments" class="router-link"
                ><span><SvgIcon icon="calendarMenu" class="calender" /></span
              ></router-link>
            </el-tooltip>
          </li>
          <li>
            <div
              style="display: flex; align-items: center"
              @click="() => router.push(`/chat/${userInfo?._id}`)"
            >
              <el-popover placement="bottom" trigger="hover" :width="420">
                <template #reference>
                  <SvgIcon icon="messengerMenu" class="cursor-pointer" />
                </template>
                <template #default>
                  <ul class="m-0 p-0 flex flex-column">
                    <li><h5 class="border-bottom py-3 m-0">Tin nhắn</h5></li>
                    <li v-for="n in 2" :key="n">
                      <MessageCard />
                    </li></ul
                ></template>
              </el-popover>
            </div>
          </li>
        </ul>

        <router-link
          v-if="!isLogin"
          to="/sign-in"
          class="d-none d-lg-inline-block mx-lg-4"
        >
          <button class="btn btn-primary">Đăng nhập</button>
        </router-link>

        <router-link
          v-if="!isLogin"
          to="/sign-up"
          class="d-none d-lg-inline-block"
        >
          <button class="btn btn-primary">Đăng ký</button>
        </router-link>

        <div v-if="isLogin" class="dropdown mx-4">
          <div
            type="button"
            id="dropdownMenuButton1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            class="dropdown-toggle d-flex align-items-center header-menu"
          >
            <img
              :src="userInfo?.avatar ? userInfo?.avatar : avatar"
              alt="Avatar"
              class="rounded-circle me-1 w-12 h-12 object-cover"
            />
          </div>
          <ul
            class="dropdown-menu dropdown-menu-end select_user_box p-2"
            aria-labelledby="dropdownMenuButton1"
          >
            <li class="user-info">
              <img
                :src="userInfo?.avatar ? userInfo?.avatar : avatar"
                alt="Avatar"
                class="rounded-circle me-1 w-12 h-12 object-cover"
              />
              <div>
                <p class="mb-1 name">
                  {{ userInfo?.name || "Trần Thị Ngà" }}
                </p>
                <p class="mb-0">
                  <a
                    data-test-id="user-info-link"
                    :href="`/user/${userInfo?._id}`"
                    >Xem hồ sơ của bạn</a
                  >
                </p>
              </div>
            </li>
            <li>
              <SvgIcon icon="userInfoIcon" />
              <p class="mb-0 ml-3">
                <router-link to="/personal-info">Thông tin cá nhân</router-link>
              </p>
            </li>
            <li v-if="userInfo?.role == 'mentor'">
              <SvgIcon icon="blogIcon" />
              <p class="mb-0 ml-4">
                <router-link to="/my-blogs">Quản lý blog</router-link>
              </p>
            </li>
            <li v-if="userInfo?.role == 'mentor'">
              <SvgIcon icon="calendarIcon" />
              <p class="mb-0 ml-4">
                <router-link to="/my-appointments"
                  >Cài đặt lịch rảnh</router-link
                >
              </p>
            </li>
            <li>
              <SvgIcon icon="bookIcon" />
              <p class="mb-0 ml-4">
                <router-link to="/course">Quản lý khóa học</router-link>
              </p>
            </li>
            <li>
              <SvgIcon icon="changePassIcon" />
              <p class="mb-0 ml-3">
                <router-link to="/change-password">Đổi mật khẩu</router-link>
              </p>
            </li>
            <!-- <li>
              <SvgIcon icon="helpIcon" />
              <p class="mb-0 ml-3">
                <router-link to="#">Trợ giúp và hỗ trợ</router-link>
              </p>
            </li> -->
            <li
              class="justify-content-center border-0"
              @click="authStore.logout()"
            >
              <!-- <SvgIcon icon="logoutIcon" /> -->
              <p class="mb-0 cursor-pointer">Đăng xuất</p>
            </li>
          </ul>
        </div>

        <div class="d-lg-none">
          <button
            class="navbar-burger d-flex align-items-center text-primaryColor p-3 rounded-3"
          >
            <SvgIcon icon="toggleMenu" />
          </button>
        </div>
      </nav>
      <div class="navbar-menu position-relative z-50 d-none">
        <div class="navbar-backdrop position-fixed"></div>
        <nav class="sidebar">
          <div class="sidebar-header">
            <a class="mr-auto text-3xl font-bold leading-none" href="#">
              <img :src="logo" alt="Logo" width="60" height="60" />
            </a>
            <button class="navbar-close p-3 rounded-3">
              <SvgIcon icon="closeMenu" />
            </button>
          </div>
          <div>
            <ul class="pl-0">
              <li
                v-for="item in navLinks"
                :key="item.path"
                class="mb-1 px-6 list-style-none"
              >
                <router-link :to="item.path" class="router-link">
                  {{ item.name }}
                </router-link>
              </li>
            </ul>
          </div>
          <div class="mt-auto">
            <div class="pt-6 px-6">
              <router-link
                to="/sign-in"
                class="btn btn-outline-primary btn-block mb-2"
              >
                Đăng nhập
              </router-link>
              <router-link
                to="/sign-up"
                class="btn btn-outline-primary btn-block mb-2"
              >
                Đăng ký
              </router-link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script lang="ts" src="./Header.ts"></script>
<style lang="css" src="./style.css"></style>
