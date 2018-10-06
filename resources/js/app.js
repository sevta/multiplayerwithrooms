import React , {Component} from 'react'
import ReactDOM from 'react-dom'
import io from 'socket.io-client'
import uuid from 'uuid'

class App extends Component {
  constructor(props) {
   super(props) 
   this.state = {
    socketId: null ,
    username: '' ,
    generate_room_code: null ,
    join_room: false ,
    join_room_code: '',
    users: [] ,
    isReady: false
   }

   this.socket = io()
   this.socket.on('room not found' , data => console.log(data))
   this.socket.on('room created' , data => this.onRoomCreated(data))
   this.socket.on('send socketid' , data => this.setState({ socketId: data.socketId } , () => console.log(this.state)))
   this.socket.on('update state' , data => this.updateStateRoom(data))
   this.socket.on('ready to play' , data => console.log(data))
  }

  updateStateRoom = data => {
    const { users } = this.state 
    console.log(data)
    this.setState({ users: [...data.users] } , () => console.log(this.state))
    users.map((user , index) => {
      console.log(user)
      if (user.is_ready == true) {
        console.log('all is allready to game')
        this.socket.emit('all allready' , {
          roomCode: this.state.generate_room_code || this.state.join_room_code ,
          text: 'all users ready to play game'
        })
      } else {
        console.log('user not ready all')
      }
    })
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

  userReady = () => {
    this.setState({ isReady: true } , () => {
      this.socket.emit('is ready' , {
        socketId: this.state.socketId ,
        isReady: true
      })
    })
  }


  render() {
    const { generate_room_code , join_room , users , isReady , socketId } = this.state 
    return (
      <div>
        <div className="container">
          <div className="row">
            <div className="col-6">
              <h1>Tesi aduh real</h1>
              <p><b>room code</b> {generate_room_code !== null && generate_room_code}</p>
              { generate_room_code == null ? (
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
              ) : null}
              <div className="form-group">
                <button className="btn btn-primary" onClick={this.submit}>create room</button>
                <span style={{ 'margin' : 10 }}>or</span>
                <button className="btn btn-secondary" onClick={this.joinRoom}>join room</button>
              </div>
            </div>
          </div>
        </div>
        <ListUsers 
          users={users} 
          onClick={this.userReady} 
          onHostClick={this.userReady} 
          disabled={isReady} 
          socketId={socketId}/>
      </div>
    )
  }
}

const ListUsers = ({users , onClick , onHostClick , disabled , socketId}) => {
  return (
    <div className='container'>
      <div className="row">
        <div className="col-4">
          { users.length !== 0 && (
            <ul>
              { users.map((user , index) => (
                <li key={index}>
                  { user.is_host ? (<b>{user.username}</b>) : user.username} <br/>
                  { user.is_host ? (
                    <div>
                      { user.socketId == socketId && (
                        <button className='btn btn-warning' onClick={onHostClick} disabled={disabled}>Start</button>
                      ) }
                    </div>
                    ) : (
                    <div>
                      { user.socketId == socketId && (
                        <button className='btn btn-info' onClick={onClick} disabled={disabled}>ready</button>
                      ) }
                    </div>
                  ) }
                  
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