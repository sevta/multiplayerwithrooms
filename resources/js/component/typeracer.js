import React, { Component } from 'react'

class TypeRacer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      words: 'tesi mandi di atap' ,
      extractWords: [] ,
      lenWords: null ,
      currentPosition: 0 ,
      currentWord: '' ,
      value: ''
    }
  }

  componentDidMount() {
    let extract = this.state.words.split(" ")
    this.state.extractWords = [...extract]
    this.setState({ 
      extractWords: this.state.extractWords , 
      lenWords: this.state.extractWords.length ,
      currentWord: this.state.extractWords[this.state.currentPosition]
    } , () => console.log(this.state))
  }

  _type = e => {
    const { value , currentWord } = this.state 
    let val = e.target.value 
    let key = e.target.name 
    console.log(val == " ")
    this.setState({ [key]: val } , () => {
      
    })
  }

  _press = e => {
    const { currentWord , value } = this.state 
    console.log(e.key)
    if (e.key == ' ') {
      if (value == currentWord) {
        this.setState({ value: '' })
        this.nextQuestion()
      } else {
        alert('bail')
      }
    }
  }

  nextQuestion() {
    const { currentPosition , currentWord } = this.state 
    if (this.state.currentPosition == this.state.extractWords.length -1) {
      this.setState({ currentWord: 'FINISHED' } , () => this.props.onFinished())
    } else {
      this.state.currentPosition = this.state.currentPosition +1
      this.setState({ 
        currentPosition: this.state.currentPosition , 
        currentWord: this.state.extractWords[this.state.currentPosition] ,
        value: ''
      })  
    }
  }

  render() {
    const { words , currentWord , value } = this.state 
    return (
      <div className='container'>
        <div className="row">
          <div className="col">
            <h3>tesi is typeracer</h3>
            <h1>{ currentWord }</h1>
            <div className="form-group">
              <input type="text" placeholder='type' name='value' value={value} className='form-control' onKeyPress={this._press} onChange={this._type}/>
            </div>
            <h3>{ this.props.notificationText }</h3>
          </div>
        </div>
      </div>
    )
  }
}

export default TypeRacer