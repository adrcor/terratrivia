<template>
  <Transition
    mode="out-in"
    enter-active-class="transition-opacity duration-100"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-100"
    leave-to-class="opacity-0"
  >
    <slot />
  </Transition>
</template>
