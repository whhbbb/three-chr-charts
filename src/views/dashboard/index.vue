<template>
  <div class="chr-container">
    <ChrDemo />
    <SearchFilter v-if="!showResults" @submitFliter="submitFliter" />
    <SearchResult v-if="showResults" @returnSearchFilter="returnSearchFilter" />
  </div>
</template>

<script>
import SearchFilter from './components/searchFilter.vue'
import SearchResult from './components/serchResult.vue'
import ChrDemo from './components/chrDemo.vue'
export default {
  components: { SearchFilter, SearchResult, ChrDemo },
  data() {
    return {
      showResults: false
    }
  },
  methods: {
    submitFliter(data) {
      console.log('54', data)
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
