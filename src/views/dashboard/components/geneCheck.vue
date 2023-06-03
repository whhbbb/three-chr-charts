<template>
  <div class="svgHolder-container">
    <div id="svgHolder" />
  </div>
</template>

<script>
export default {
  mounted() {
    // 这个包npm下载不了 所以只能这么引入（大概 所以后面让忽略了一下
    const script = document.createElement('script')
    script.src = '//www.biodalliance.org/release-0.13/dalliance-compiled.js'
    script.async = true
    script.onload = this.initializeBrowser
    document.head.appendChild(script)
  },
  methods: {
    initializeBrowser() {
      // eslint-disable-next-line
      new Browser({
        chr: '22',
        viewStart: 30700000,
        viewEnd: 30900000,

        coordSystem: {
          speciesName: 'Human',
          taxon: 9606,
          auth: 'GRCh',
          version: '37',
          ucscName: 'hg19'
        },

        sources: [
          {
            name: 'Genes',
            desc: 'Gene structures from GENCODE 19',
            bwgURI: '//www.biodalliance.org/datasets/gencode.bb',
            stylesheet_uri: '//www.biodalliance.org/stylesheets/gencode.xml',
            collapseSuperGroups: true,
            trixURI: '//www.biodalliance.org/datasets/geneIndex.ix',
            pinned: true
          }
        ]
      })
    }
  }
}
</script>

<style scoped lang="scss">
.svgHolder-container {
  width: 700px;
  height: 400px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
}
</style>
