<script lang="ts" setup>
import { computed } from "vue";
import { useData } from "vitepress";
import VPSwitchAppearance from "./VPSwitchAppearance.vue";

const { site } = useData();

const localeHref = computed(() => {
  if (typeof window === "undefined") return "/uk/";

  const { pathname, search, hash } = window.location;
  const isUkrainian = pathname === "/uk" || pathname.startsWith("/uk/");

  const nextPath = isUkrainian
    ? pathname.replace(/^\/uk(?=\/|$)/, "") || "/"
    : pathname === "/"
      ? "/uk/"
      : `/uk${pathname}`;

  return `${nextPath}${search}${hash}`;
});

const localeLabel = computed(() => {
  if (typeof window === "undefined") return "UA";

  const { pathname } = window.location;
  const isUkrainian = pathname === "/uk" || pathname.startsWith("/uk/");
  return isUkrainian ? "EN" : "UA";
});
</script>

<template>
  <div
    v-if="
      site.appearance &&
      site.appearance !== 'force-dark' &&
      site.appearance !== 'force-auto'
    "
    class="VPNavBarAppearance"
  >
    <a class="locale-switch" :href="localeHref" :title="localeLabel">
      {{ localeLabel }}
    </a>
    <VPSwitchAppearance />
  </div>
</template>

<style scoped>
.VPNavBarAppearance {
  display: none;
  align-items: center;
  gap: 10px;
}

@media (min-width: 1280px) {
  .VPNavBarAppearance {
    display: flex;
  }
}

.locale-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 22px;
  padding: 0 10px;
  border: 1px solid var(--vp-input-border-color);
  border-radius: 999px;
  background: var(--vp-input-switch-bg-color);
  color: var(--vp-c-text-1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  transition:
    border-color 0.25s ease,
    color 0.25s ease,
    background-color 0.25s ease;
}

.locale-switch:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
</style>
