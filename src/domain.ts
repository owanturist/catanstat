export abstract class Color {
  abstract readonly id: 'red' | 'blue' | 'yellow' | 'white' | 'brown' | 'green'
  abstract readonly label: string
  abstract readonly hex: string

  public static red: Color = {
    id: 'red',
    label: 'Red',
    hex: '#ff595e'
  }
  public static blue: Color = {
    id: 'blue',
    label: 'Blue',
    hex: '#1982c4'
  }
  public static yellow: Color = {
    id: 'yellow',
    label: 'Yellow',
    hex: '#ffca3a'
  }
  public static white: Color = {
    id: 'white',
    label: 'White',
    hex: '#e2e2df'
  }
  public static brown: Color = {
    id: 'brown',
    label: 'Brown',
    hex: '#d68c45'
  }
  public static green: Color = {
    id: 'green',
    label: 'Green',
    hex: '#8ac926'
  }
}
