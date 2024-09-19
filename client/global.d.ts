import vi from './messages/vi.json'

type Messages = typeof vi

declare global {
  interface IntlMessages extends Messages {}
}
