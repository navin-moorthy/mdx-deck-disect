import React from 'react'
import PropTypes from 'prop-types'
import { MDXProvider } from '@mdx-js/tag'
import styled, { ThemeProvider } from 'styled-components'
import { space, width, height, color } from 'styled-system'
import debounce from 'debounce'

import defaultTheme from './theme'
import defaultComponents from './components'

export { default as Theme } from './theme'
export { default as Components } from './components'

export const inc = state => ({ index: (state.index + 1) % state.length })
export const dec = state =>
  state.index > 0 ? { index: (state.index - 1) % state.length } : null

const CarouselRoot = styled.div([], {
  display: 'flex',
  overflowX: 'auto',
  width: '100%',
  height: '100%',
  scrollSnapType: 'mandatory',
  '::-webkit-scrollbar': {
    display: 'none'
  }
})

export class Carousel extends React.Component {
  root = React.createRef()
  isScroll = false

  handleScroll = debounce(e => {
    if (this.isScroll) {
      this.isScroll = false
      return
    }

    const el = this.root.current
    if (!el) return
    const { scrollLeft } = el
    const rect = el.getBoundingClientRect()
    const n = Math.round(scrollLeft / rect.width)
    this.props.onScroll(n)
  }, 200)

  handleResize = debounce(e => {
    this.scrollTo(this.props.index)
  }, 200)

  scrollTo = index => {
    if (!this.root.current) return
    const el = this.root.current.querySelector('#slide-' + index)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth' })
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
    this.root.current.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    this.root.current.removeEventListener('scroll', this.handleScroll)
  }

  componentDidUpdate(prev) {
    if (prev.index === this.props.index) return
    this.isScroll = true
    this.scrollTo(this.props.index)
  }

  render() {
    const { onScroll, index, ...props } = this.props

    return <CarouselRoot innerRef={this.root} {...props} />
  }
}

export const Slide = styled.div(
  [],
  {
    flex: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%',
    height: '100%'
  },
  space,
  color
)

Slide.defaultProps = {
  p: 3,
  color: 'text',
  bg: 'background'
}

const Dot = styled.button(
  [],
  {
    appearance: 'none',
    background: 'transparent',
    border: '4px solid transparent',
    backgroundClip: 'padding-box',
    borderRadius: '9999px',
    width: '8px',
    height: '8px',
    '&:focus': {
      outline: 'none',
      boxShadow: '0 0 0 1px'
    }
  },
  props => ({
    opacity: props.active ? 0.5 : 0.125
  }),
  space,
  color
)

Dot.defaultProps = {
  m: 0,
  p: 1,
  bg: 'currentcolor'
}

const Flex = styled.div(
  [],
  {
    display: 'flex',
    justifyContent: 'center'
  },
  space
)

export const Dots = ({ index, length, onClick, ...props }) => (
  <Flex {...props}>
    {Array.from({ length }).map((n, i) => (
      <Dot
        key={i}
        active={i <= index}
        title={'go to: ' + i}
        onClick={e => {
          onClick(i)
        }}
      />
    ))}
  </Flex>
)

export const Root = styled.div(
  [],
  {},
  props => (props.theme.font ? { fontFamily: props.theme.font } : null),
  props => props.theme.css,
  width,
  height
)
export default class SlideDeck extends React.Component {
  static propTypes = {
    slides: PropTypes.array.isRequired
  }

  static defaultProps = {
    slides: [],
    theme: defaultTheme,
    components: defaultComponents,
    width: '100vw',
    height: '100vh'
  }

  state = {
    length: this.props.slides.length,
    index: 0
  }

  update = fn => this.setState(fn)

  handleKeyDown = e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault()
        this.update(inc)
        break
      case 'ArrowLeft':
        e.preventDefault()
        this.update(dec)
        break
    }
  }

  componentDidMount() {
    document.body.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.handleKeyDown)
  }

  render() {
    const { slides, theme, components, width, height } = this.props
    const { index, length } = this.state

    return (
      <ThemeProvider theme={theme}>
        <MDXProvider components={components}>
          <Root width={width} height={height}>
            <Carousel
              index={index}
              onScroll={index => {
                this.setState({ index })
              }}
            >
              {slides.map((Component, i) => (
                <Slide key={i} id={'slide-' + i}>
                  <Component />
                </Slide>
              ))}
            </Carousel>
            <Dots
              mt={-48}
              mx='auto'
              index={index}
              length={length}
              onClick={index => this.setState(index)}
            />
          </Root>
        </MDXProvider>
      </ThemeProvider>
    )
  }
}
