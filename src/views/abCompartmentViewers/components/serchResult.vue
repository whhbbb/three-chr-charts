<template>
  <div class="main-bfc-container">
    <div class="chr-main-container" :style="{minHeight: minHeight}">

      <div class="charts-container">
        <AbViewer ref="charts" :filter="filterData" />
      </div>
    </div>
  </div>
</template>

<script>

import AbViewer from './abViewer.vue'
export default {
  name: 'Home',
  components: { AbViewer },
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
  // background-color: #051F2C;
}

.charts-container {
  position: relative;
  width: 100%;
  max-width: 2200px;
  min-width: 1100px;
  left: 50%;
  transform: translateX(-50%);
  padding-top: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>
