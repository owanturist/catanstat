export type ColorId = 'red' | 'blue' | 'yellow' | 'white' | 'brown' | 'green'

export abstract class Color {
  abstract readonly id: ColorId
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

  private static readonly COLORS_MAP: Record<ColorId, Color> = {
    red: Color.red,
    blue: Color.blue,
    yellow: Color.yellow,
    white: Color.white,
    brown: Color.brown,
    green: Color.green
  }

  public static fromId(colorId: ColorId): Color {
    return this.COLORS_MAP[colorId]
  }
}

export type DieNumber = 1 | 2 | 3 | 4 | 5 | 6

export type DieEvent = 'yellow' | 'blue' | 'green' | 'black'
