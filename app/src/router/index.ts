import { useAuthStore } from "@/stores/auth";
import Account from "@/views/Account.vue";
import Home from "@/views/Home.vue";
import NotFound from "@/views/NotFound.vue";
import Practice from "@/views/Practice.vue";
import Trial from "@/views/TrialResult.vue";
import ForgotPassword from "@/views/auth/ForgotPassword.vue";
import Login from "@/views/auth/Login.vue";
import Register from "@/views/auth/Register.vue";
import ResetPassword from "@/views/auth/ResetPassword.vue";
import UpdatePassword from "@/views/auth/UpdatePassword.vue";
import type { RouteLocationNormalized } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/account",
      name: "account",
      component: Account,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { requiresNoAuth: true },
    },
    {
      path: "/register",
      name: "register",
      component: Register,
      meta: { requiresNoAuth: true },
    },
    {
      path: "/update-password",
      name: "update-password",
      component: UpdatePassword,
      meta: { requiresAuth: true },
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: ForgotPassword,
      meta: { requiresNoAuth: true },
    },
    {
      path: "/reset-password",
      name: "reset-password",
      component: ResetPassword,
      meta: { requiresNoAuth: true },
    },
    {
      path: "/trial/:id",
      name: "trial",
      component: Trial,
      meta: { requiresAuth: true },
    },
    {
      path: "/practice",
      name: "practice",
      component: Practice,
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFound,
    },
  ],
});

router.beforeEach((to: RouteLocationNormalized, _: RouteLocationNormalized) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login" };
  }

  if (to.meta.requiresNoAuth && auth.isAuthenticated) {
    return { name: "home" };
  }
});

export function useRouter() {
  return router;
}
