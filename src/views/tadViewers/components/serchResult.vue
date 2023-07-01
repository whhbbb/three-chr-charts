<template>
  <div class="main-bfc-container">
    <div class="chr-main-container" :style="{minHeight: minHeight}">
      <div class="charts-container">
        <tadViewers ref="charts" :filter="filter" />
      </div>
    </div>
  </div>
</template>

<script>
import tadViewers from './tadViewer.vue'
export default {
  name: 'Home',
  components: { tadViewers },
  props: {
    filter: {
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
}

.charts-container {
  position: relative;
  width: 90%;
  max-width: 2200px;
  min-width: 1100px;
  left: 50%;
  transform: translateX(-50%);
  padding-top: 80px;
}

</style>
