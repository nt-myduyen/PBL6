import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";

import SvgIcon from "./components/BUI/SvgIcon/SvgIcon.vue";
import "./assets/index.css";
import "./assets/main.css";
import "./style.css";

const app = createApp(App);

app.component("SvgIcon", SvgIcon);

app.use(createPinia());
app.use(router);

app.mount("#app");