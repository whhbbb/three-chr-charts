<template>
  <div class="chr-container">
    <SearchFilter v-if="!showResults" @submitFliter="submitFliter" />
    <SearchResult v-if="showResults" :filter-data="filterData" @returnSearchFilter="returnSearchFilter" />
  </div>
</template>

<script>
import SearchFilter from './components/searchFilter.vue'
import SearchResult from './components/serchResult.vue'
export default {
  components: { SearchFilter, SearchResult },
  data() {
    return {
      showResults: false,
      filterData: {},
      compartment: {}
    }
  },
  methods: {
    submitFliter(data) {
      this.filterData = data
      this.showResults = true
    },
    returnSearchFilter() {
      this.showResults = false
    }
  }
}
</script>

<style scoped>

</style>
