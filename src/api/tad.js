import request from '@/utils/request'

export function hicResult(cs_id1, tissue_id, params) {
  return request({
    url: `/hic/cs_id1/${cs_id1}/cs_id2/${cs_id1}/tissue_id/${tissue_id}`,
    params
  })
}
