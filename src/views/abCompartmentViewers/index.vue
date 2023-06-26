<template>
  <div class="chr-container">
    <SearchFilter @submitFliter="submitFliter" />
    <SearchResult ref="charts" :filter-data="filterData" @returnFilter="returnFilter" />
  </div>
</template>

<script>
import SearchFilter from './components/searchFilter.vue'
import SearchResult from './components/serchResult.vue'
export default {
  components: { SearchFilter, SearchResult },
  data() {
    return {
      filterData: {},
      compartment: {}
    }
  },
  methods: {
    submitFliter(data) {
      this.$refs.charts.$refs.charts.makeCharts()
      this.filterData = data
    },
    makeCharts() {
    }
  }
}
</script>

<style scoped>

</style>
