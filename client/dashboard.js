import React from 'react'
import ReactDOM from 'react-dom'
import 'whatwg-fetch'

document.title = 'Dashboard | Media Monitor'

class Block extends React.Component {
  render() {
    return (
      <div
        className="Block"
        style={{background: this.props.alert ? '#FC5130' : '#F9F9F9'}}>
        <div>
          <a>
            <span className="Block__title">{this.props.title}</span>
            <span className="Block__subtitle">{this.props.subtitle}</span>
          </a>
        </div>
      </div>
    )
  }
}

class Blocks extends React.Component {
  render() {

    return (
      <div className="blocks">
        <h2>{this.props.title}</h2>
        <p className="subtext">Approx. 60 second delay</p>
        <div>{this.props.blocks}</div>
      </div>
    )
  }
}

class Dashboard extends React.Component {

  constructor(props) {
    super(props)
    this.state = {data: {}}
    this.update = this.update.bind(this)
  }

  render() {

    const UPDATE_INTERVAL = 60000 // 1 minute
    const blocks = []

    // data has loaded
    if (Object.keys(this.state.data).length > 0) {

      // format dates
      const lastTweet = new Date(this.state.data['last_tweet'])
      const lastCheck = new Date(this.state.data.timestamp)
      const formatDate = (date) => {
        return `${date.toDateString()} @ ${date.toTimeString().slice(0,5)}`
      }
      const minutesElapsedSince = (date) => {
        return Math.floor((new Date() - date) / 60000)
      }

      // add blocks
      blocks.push(
        <Block
          key={0}
          title={this.state.data.count.tweets}
          subtitle="tweets"
          />
      )
      blocks.push(
        <Block
          key={1}
          title={this.state.data.count.users}
          subtitle="users"
          />
      )
      blocks.push(
        <Block
          key={2}
          title={this.state.data.count.archive}
          subtitle="archived"
          />
      )
      blocks.push(
        <Block
          key={3}
          title={formatDate(lastCheck)}
          subtitle="last check"
          />
      )

      // alert if last tweet received > 5 mins
      if (minutesElapsedSince(lastTweet) > 5) {
        blocks.push(
          <Block
            alert
            key={4}
            title={formatDate(lastTweet)}
            subtitle="last tweet received"
            />
        )
      } else {
        blocks.push(
          <Block
            key={4}
            title={formatDate(lastTweet)}
            subtitle="last tweet received"
            />
        )
      }
    }

    // update every
    window.setTimeout(this.update, UPDATE_INTERVAL)

    return <Blocks title="Statistics" blocks={blocks} />
  }

  update() {
    // fetch status
    fetch('/api/status')
    .then(response => response.json())
    .then(data => this.setState({data: data}))
    .catch(e => console.log(e))
  }

  componentDidMount() {
    this.update()
  }
}

ReactDOM.render(<Dashboard />, document.querySelector('#app'))
