import React from 'react'
import ReactDOM from 'react-dom'

export class App extends React.Component {
  render() {
    return (
      <div>Hello Everyone, this is a really working React app!</div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
