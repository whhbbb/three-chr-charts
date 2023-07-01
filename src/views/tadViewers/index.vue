<template>
  <div class="chr-container">
    <SearchFilter @submitFliter="submitFliter" />
    <SearchResult ref="charts" :filter="filter" />
  </div>
</template>

<script>
import SearchFilter from './components/searchFilter.vue'
import SearchResult from './components/serchResult.vue'
export default {
  components: { SearchFilter, SearchResult },
  data() {
    return {
      filter: {},
      compartment: {}
    }
  },
  methods: {
    submitFliter(data) {
      this.filter = data
      this.$nextTick(() => {
        this.$refs.charts.$refs.charts.makeCharts()
      })
    }
  }
}
</script>

<style scoped>

</style>
