export abstract class Color<ID extends string = string> {
  abstract readonly id: ID
  abstract readonly label: string
  abstract readonly hex: string

  public static red: Color<'red'> = {
    id: 'red',
    label: 'Red',
    hex: '#ff595e'
  }
  public static blue: Color<'blue'> = {
    id: 'blue',
    label: 'Blue',
    hex: '#1982c4'
  }
  public static yellow: Color<'yellow'> = {
    id: 'yellow',
    label: 'Yellow',
    hex: '#ffca3a'
  }
  public static white: Color<'white'> = {
    id: 'white',
    label: 'White',
    hex: '#e2e2df'
  }
  public static brown: Color<'brown'> = {
    id: 'brown',
    label: 'Brown',
    hex: '#d68c45'
  }
  public static green: Color<'green'> = {
    id: 'green',
    label: 'Green',
    hex: '#8ac926'
  }
}
