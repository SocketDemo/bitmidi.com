import { h } from 'preact' /** @jsx h */

import App from '../views/app'
import Provider from 'preact-context-provider'

import config from '../../config'

export default function getProvider (store, dispatch) {
  return (
    <Provider store={store} dispatch={dispatch} theme={config.theme}>
      <App />
    </Provider>
  )
}
