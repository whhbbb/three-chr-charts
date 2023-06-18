import request from '@/utils/request'

// 查找物种
export function dropDownSpecies() {
  return request({
    url: '/option/species'
  })
}

// 查找所有品种
export function dropDownCultivarAll() {
  return request({
    url: '/option/cultivar/all'
  })
}
// 根据物种查找品种
export function dropDownCultivar(speciesId) {
  return request({
    url: `/option/cultivar/id/${speciesId}`
  })
}

// 查找所有染色体
export function dropDownChromosomeAll() {
  return request({
    url: '/option/chromosome/all'
  })
}
// 根据品种查找染色体
export function dropDownChromosome(cultivarId) {
  return request({
    url: `/option/chromosome/id/${cultivarId}`
  })
}
