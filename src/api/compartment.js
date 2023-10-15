import request from '@/utils/request'

export function compartmentResult(cs_id, tissue_id, software_id, params) {
  return request({
    url: `/compartment/cs_id/${cs_id}/tissue_id/${tissue_id}/software/${software_id}`,
    params
  })
}
