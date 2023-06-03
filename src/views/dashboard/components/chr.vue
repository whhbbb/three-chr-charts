<template>
  <el-card class="all-container">
    <div id="juicebox-container" class="juicebox-container" />
  </el-card>
</template>

<script>
export default {
  mounted() {
    const config = {
      url: 'https://www.encodeproject.org/files/ENCFF718AWL/@@download/ENCFF718AWL.hic',
      name: 'TAD',
      locus: 'ace',
      tracks: []
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/juicebox.js@2.3.1/dist/juicebox.min.js'
    script.onload = () => {
      // eslint-disable-next-line
      juicebox.init(document.getElementById('juicebox-container'), config)
        .then(browser => {
          console.log(`${browser.id} is good to go`)
        })
        .catch(error => {
          console.error('Error initializing Juicebox:', error)
        })
    }

    document.head.appendChild(script)
  }
}
</script>

<style lang="scss" scoped>
@import url("https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css");
@import url("https://cdn.jsdelivr.net/npm/juicebox.js@2.3.1/dist/css/juicebox.css");
.all-container {

}

</style>
