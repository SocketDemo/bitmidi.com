
import Heading from './heading'
import Random from './random'
import Page from './page'

export default class ErrorPage extends Page {
  load () {
    const { dispatch } = this.context
    const err = this.getError()
    dispatch('APP_META', { title: err.message })
  }

  render (props) {
    const err = this.getError()

    return (
      <div class='tc'>
        <Random>
          <div>
            <Heading>Well, this is embarrassingβ¦</Heading>
            <ErrorEmoji>π</ErrorEmoji>
          </div>
          <div>
            <Heading>You just blew our server's mind</Heading>
            <ErrorEmoji>π³π₯π΅</ErrorEmoji>
          </div>
          <div>
            <Heading>We're sorry.</Heading>
            <ErrorEmoji>π’ ππ</ErrorEmoji>
          </div>
          <div>
            <Heading>What does the fox say?</Heading>
            <ErrorEmoji>β π¦π¬</ErrorEmoji>
          </div>
          <div>
            <Heading>Holy crap!</Heading>
            <ErrorEmoji>π π©</ErrorEmoji>
          </div>
          <div>
            <Heading>Oh snap!</Heading>
            <ErrorEmoji>π²π₯</ErrorEmoji>
          </div>
        </Random>
        <Heading>Error β {err.message}</Heading>
      </div>
    )
  }

  getError = () => {
    const { errors } = this.context.store
    return errors[errors.length - 1] || { message: 'Not Found' }
  }
}

const ErrorEmoji = ({ children }) => {
  return <div class='f-headline mv4'>{children}</div>
}
