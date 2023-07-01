<template>
  <div class="main-bfc-container">
    <div class="chr-main-container" :style="{minHeight: minHeight}">
      <div class="charts-container">
        <ChromationLoop ref="charts" :filter="filterData" />
      </div>
    </div>
  </div>
</template>

<script>

import ChromationLoop from './chromationLoop.vue'
export default {
  name: 'Home',
  components: { ChromationLoop },
  props: {
    filterData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      compartment: [],
      minHeight: window.innerHeight - 50 + 'px'
    }
  },
  created() {
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">
.chr-main-container {
  width: 100%;
  position: relative;
}

.charts-container {
  position: relative;
  width: 90%;
  max-width: 2200px;
  min-width: 1100px;
  left: 50%;
  transform: translateX(-50%);
  padding-top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>
