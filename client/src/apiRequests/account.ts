import http from '@/lib/http'
import {AccountResType} from '@/schemaValidations/account.schema'

const accountApiRequest = {
  me: () => http.get<AccountResType>('/accounts/me')
}

export default accountApiRequest
