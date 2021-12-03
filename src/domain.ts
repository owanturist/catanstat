import cx from 'classnames'

export abstract class Color {
  abstract readonly id: string
  abstract readonly label: string
  abstract readonly text: string
  abstract readonly bg: string

  public static red: Color = {
    id: 'red',
    label: 'Red',
    text: cx('text-[#ff595e]'),
    bg: cx('bg-[#ff595e]')
  }
  public static blue: Color = {
    id: 'blue',
    label: 'Blue',
    text: cx('text-[#1982c4]'),
    bg: cx('bg-[#1982c4]')
  }
  public static yellow: Color = {
    id: 'yellow',
    label: 'Yellow',
    text: cx('text-[#ffca3a]'),
    bg: cx('bg-[#ffca3a]')
  }
  public static white: Color = {
    id: 'white',
    label: 'White',
    text: cx('text-[#e2e2df]'),
    bg: cx('bg-[#e2e2df]')
  }
  public static brown: Color = {
    id: 'brown',
    label: 'Brown',
    text: cx('text-[#d68c45]'),
    bg: cx('bg-[#d68c45]')
  }
  public static green: Color = {
    id: 'green',
    label: 'Green',
    text: cx('text-[#8ac926]'),
    bg: cx('bg-[#8ac926]')
  }
}
