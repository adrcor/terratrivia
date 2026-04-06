import App from "./App.vue";
import anronGestalt from "./assets/icons/anron-gestalt.json";
import "./style.css";
import { useRouter } from "@/router";
import { addCollection } from "@iconify/vue";
import ui from "@nuxt/ui/vue-plugin";
import { createPinia } from "pinia";
import { createApp } from "vue";

addCollection(anronGestalt);

const app = createApp(App);

const router = useRouter();
app.use(router);

const pinia = createPinia();
app.use(pinia);

app.use(ui);

app.mount("#app");
