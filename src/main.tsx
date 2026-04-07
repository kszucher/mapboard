import './index.css'
import ReactDOM from 'react-dom/client'
import {Provider} from "react-redux"
import {appStore} from "./appStore/appStore.ts"
import {App} from "./componentsApp/App"
import '@radix-ui/themes/styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={appStore}>
    <App />
  </Provider>
)
