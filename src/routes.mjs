/**
 * List of routes in the app. Specified as [routeName, routePath, routePage].
 */

import DocPage from './views/doc-page'
import ErrorPage from './views/error-page'
import HomePage from './views/home-page'
import SearchPage from './views/search-page'
import SnippetPage from './views/snippet-page'
import SubmitPage from './views/submit-page'

export default [
  ['home', '/', HomePage],
  ['submit', '/submit', SubmitPage],
  ['search', '/search', SearchPage],
  ['doc', '/docs/:url+', DocPage],
  ['snippet', '/:snippetId', SnippetPage],
  ['error', '(.*)', ErrorPage]
]
