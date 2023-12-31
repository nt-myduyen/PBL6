import { createApp } from "vue";
import Vue3Marquee from "vue3-marquee";
import router from "./router";
import App from "./App.vue";

import ElementPlus from "element-plus";
import VueVideoPlayer from "@videojs-player/vue";
import "video.js/dist/video-js.css";

import SvgIcon from "./components/BUI/SvgIcon/SvgIcon.vue";
import "./assets/css/button.css";
import "./assets/css/form.css";
import "./assets/css/tooltip.css";
import "./assets/css/calendar-custom.css";
import "./assets/index.css";
import "./assets/main.css";
import "./style.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "element-plus/dist/index.css";

const app = createApp(App);

app.component("SvgIcon", SvgIcon);
app.use(router);
app.use(ElementPlus);
app.use(Vue3Marquee);
app.use(VueVideoPlayer);

app.mount("#app");
