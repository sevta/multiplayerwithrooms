import React , {Component} from 'react'
import ReactDOM from 'react-dom'
import io from 'socket.io-client'
import uuid from 'uuid'

class App extends Component {
  constructor(props) {
   super(props) 
   this.state = {
    username: '' ,
    generate_room_code: null ,
    join_room: false ,
    join_room_code: '',
    users: []
   }

   this.socket = io()

   this.socket.on('room not found' , data => console.log(data))
   this.socket.on('room created' , data => this.onRoomCreated(data))
  }

  onRoomCreated = data => {
    this.state.users = [...data.users]
    this.setState({ users: this.state.users } , () => console.log(this.state))
  }

  _onChange = e => {
    let key = e.target.name 
    let value = e.target.value 
    this.setState({ [key] : value } , () => console.log(this.state))
  }

  submit = () => {
    this.setState({ generate_room_code: uuid.v4() } , () => {
      this.socket.emit('create room' , {
        username: this.state.username ,
        room_code: this.state.generate_room_code
      })
    })
  }

  joinRoom = () => {
    this.setState({ join_room: true })
  }

  gotoJoinRoom = e => {
    if (e.key == 'Enter') {
      this.socket.emit('join room' , {
        username: this.state.username ,
        room_code: this.state.join_room_code
      })
    }
  }

  handlePress = e => {
    if (e.key == 'Enter') {
      this.submit()
    }
  }

  render() {
    const { generate_room_code , join_room , users } = this.state 
    return (
      <div>
        <div className="container">
          <div className="row">
            <div className="col-6">
              <h1>Tesi aduh real</h1>
              <p><b>room code</b> {generate_room_code !== null && generate_room_code}</p>
              <div className="form-group">
                { join_room && (
                  <input  
                  type="text" 
                  className='form-control' 
                  placeholder='room_code' 
                  name='join_room_code' 
                  onKeyPress={this.gotoJoinRoom}
                  onChange={this._onChange}/>
                ) }
                { generate_room_code == null ? (
                  <input  
                  type="text" 
                  className='form-control' 
                  placeholder='username' 
                  name='username' 
                  onKeyPress={this.handlePress}
                  onChange={this._onChange}/>
                ) : null }
              </div>
              <div className="form-group">
                <button className="btn btn-primary" onClick={this.submit}>create room</button>
                <span style={{ 'margin' : 10 }}>or</span>
                <button className="btn btn-secondary" onClick={this.joinRoom}>join room</button>
              </div>
            </div>
          </div>
        </div>
        <ListUsers users={users} />
      </div>
    )
  }
}

const ListUsers = ({users}) => {
  return (
    <div className='container'>
      <div className="row">
        <div className="col-4">
          { users.length && (
            <ul>
              { users.map((user , index) => (
                <li key={index}>
                  { user.is_host ? (<b>{user.username}</b>) : user.username}
                </li>
              )) }
            </ul>
          ) }
        </div>
      </div>
    </div>
  )
}

let roots = document.querySelector('#app')
ReactDOM.render(<App /> , roots )