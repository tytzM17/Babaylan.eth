import React, { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'
import { Lokimon } from '../../models'
import MyFightingMons from './myFightingMons'
import { breedOption } from '../common'
import getAccount from '../../utils/getAccount'
import GenericModal from '../common/genericModal'
import { toast } from 'react-toastify'
import { toastErrParams } from '../../utils/toastErrParams'
import { getFirst7AndLast4CharOfAcct } from '.'
// import { useWs } from './index'
// import { waitForWsConnection } from '../../utils'


/**
 * Room UI
 * 
 * @param {Object} props
 * @param {Object} props.room
 */
const Room = ({
  room,
  onDisconnect,
  account,
  fightChoice1,
  fightChoice2,
  monNames,
  cryptomons,
  setFightChoice2Func,
  setFightChoice1Func,
  // isDisbanded,
  ws,
  // onOtherPlayerReady,
  // acceptedAndReadyPlayer,
}) => {
  const navigate = useNavigate()
  // const { ws } = useWs()

  const [otherPlayer, setOtherPlayer] = useState<string>(null)
  const [otherPlayerMons, setOtherPlayerMons] = useState<Lokimon[]>(null)
  const [creatorMons, setCreatorMons] = useState<Lokimon[]>(null)
  const [_account, setAccount] = useState<string>(account)

  useEffect(() => {
    let mounted = true
    if (!account && mounted) {
      ;(async () => {
        const acct = await getAccount()
        setAccount(acct)
      })()
    }

    return () => {
      mounted = false
    }
  }, [account])

  useEffect(() => {
    if (!room || !room.players) return
    const _otherPlayer = room.players.find((player: string) => player !== room.creator)
    setOtherPlayer(_otherPlayer)
  }, [room])

  useEffect(() => {
    if (!cryptomons || !otherPlayer || !room?.creator) return
    const _otherPlayerMons = cryptomons.filter((mon: Lokimon) => otherPlayer === mon.owner)

    setOtherPlayerMons(_otherPlayerMons)
    setCreatorMons(cryptomons.filter((mon: Lokimon) => room.creator === mon.owner))
  }, [cryptomons, otherPlayer, room?.creator])

  const [show, setShow] = useState(false)
  const [disconConfirm, setDisconConfirm] = useState(false)
  const [otherPlayerReady, setOtherPlayerReady] = useState(false)
  const [disableBtn, setDisableBtn] = useState(false)

  const handleClose = (state: boolean) => {
    setShow(false)
    setDisconConfirm(state)
  }
  const handleShow = () => {
    setShow(true)
  }

  const handleOtherPlayerReady = () => {
    // if (!otherPlayer) return

    // onOtherPlayerReady(room, otherPlayer)
    // setOtherPlayerReady((current) => !current)
    // if (!otherPlayerReady) return

    const obj = { type: 'ready', params: { room, otherPlayer } }
    if (ws) {
      if (otherPlayer === _account) {
        ws.send(JSON.stringify(obj))
        // waitForWsConnection(ws, ws?.send(JSON.stringify(obj)), 1000)
      }
    }
    // setDisableBtn(true)
  }

  useEffect(() => {
    if (!ws) return

    ws.onmessage = function incoming(data) {
      if (!data || !data.data) return
      const parsed = JSON.parse(data.data)

      switch (parsed?.type) {
        case 'leave':
          console.log('room leave data', parsed)
          if (parsed?.params?.room === room?.room) {
            // if (parsed?.params?.isClosed && _account === otherPlayer) {
              // onDisconnect(null)

            
              
     


              toast.error(
                parsed?.params?.isClosed ? 'Room owner disconnected at room ' + parsed?.params?.room :
                getFirst7AndLast4CharOfAcct(parsed?.params?.leaver)  + ' disconnected at room ' + parsed?.params?.room,
               toastErrParams,
             )

             
             const roomToLeave = { ...room }
             roomToLeave['leaver'] = getFirst7AndLast4CharOfAcct(_account)
             onDisconnect(roomToLeave)
        

              // navigate('/arena', {
              //   state: { roomCode: parsed.params?.room , isDisbandedAndOtherPlayer: true },
              // })
           // }
          }
          break
        case 'ready':
          console.log('other player ready data', parsed)
          if (parsed?.params?.room?.creator === account) {
            const isOnSameRoom = room?.room === parsed?.params?.room?.room
            const hasOtherPlayer = room?.players?.includes(parsed?.params?.otherPlayer)
            const _otherPlayerReady = isOnSameRoom && hasOtherPlayer
            setOtherPlayerReady(_otherPlayerReady)
          }
          break
      }
    }
  }, [ws, ws.onmessage])

  useEffect(() => {
    // let mounted = true
    if (!disconConfirm || !ws) return

    // if (mounted) {
      const roomToLeave = { ...room }
      roomToLeave['leaver'] = _account
      onDisconnect(roomToLeave)
      
      // navigate('/arena', { state: { room, leaver: account } })
    // }

    // ws,send to all connected , prompt and set start redirect to null or empty
    

  }, [disconConfirm])

  const genericModalProps = {
    show,
    handleClose: (state: boolean) => handleClose(state),
    title: 'Disconnect',
    content: 'Are you sure ? This room will be disbanded or disconnected.',
  }

  const handleFightStart = () => {
    alert('start fight, get choices to fight func in contract')
    setDisableBtn(false)
  }

  return (
    <div className='room-container'>
      {/* {isDisbanded && <Navigate to='/arena' />} */}
      <div className='p1-arena green-glow'>Room {room?.room}</div>
      <GenericModal {...genericModalProps} />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          disabled={disableBtn}
          className='rpgui-button'
          type='button'
          onClick={() => handleShow()}
        >
          {room?.creator === account ? 'Disband' : 'Disconnect'}
        </button>

        {_account === otherPlayer && (
          <button
            className='rpgui-button'
            type='button'
            onClick={() => {
              console.log('ready')
              handleOtherPlayerReady()
            }}
          >
            {otherPlayerReady ? 'Waiting for start' : 'Ready'}
          </button>
        )}

        {_account === room?.creator && otherPlayerReady && (
          <button
            className='rpgui-button'
            type='button'
            onClick={() => {
              console.log('start or wait')
              handleFightStart()
            }}
          >
            Start fight!
          </button>
        )}
      </div>

      {/* upper isle */}
      <div className='rpgui-container framed-grey vs-container' style={{ marginTop: '24px' }}>
        <Container fluid>
          <Row>
            <Col xs md='12' className='col-text-center'>
              Selected Lokimon
            </Col>
            <Col xs='12' lg='12' className='col-text-center'>
              <span>
                {
                  monNames[
                    cryptomons.find(
                      (mon: Lokimon) => mon.id?.toString() === fightChoice1?.toString(),
                    )?.species
                  ]
                }{' '}
                {fightChoice1 ? `no.${fightChoice1}` : fightChoice1 == '0' ? `no.${0}` : ''}
              </span>
            </Col>
            <Col xs='12' lg='12' className='col-text-center'>
              <span>
                {
                  monNames[
                    cryptomons.find(
                      (mon: Lokimon) => mon.id?.toString() === fightChoice2?.toString(),
                    )?.species
                  ]
                }{' '}
                {fightChoice2 ? `no.${fightChoice2}` : ''}
              </span>
            </Col>
          </Row>
          <div className='dojo-spar-mons-img'>
            {breedOption(parseInt(fightChoice1), cryptomons)}
            {breedOption(parseInt(fightChoice2), cryptomons)}
          </div>
        </Container>
      </div>

      {/* fight mons area, fight against area */}

      {_account === room?.creator && (
        <div className='rpgui-container framed-grey table-container'>
          <Row>
            <Col xs md={12}>
              <div style={{ textAlign: 'center' }}>Player 1 Select</div>
            </Col>
          </Row>
          <Row>
            <Col xs md={12}>
              <div className='dojo-selection'>
                <MyFightingMons
                  mons={creatorMons}
                  setFightChoiceFunc={setFightChoice1Func}
                  account={room?.creator}
                  choice='1'
                />
              </div>
            </Col>
          </Row>
        </div>
      )}

      {_account === otherPlayer && (
        <div className='rpgui-container framed-grey table-container'>
          <Row>
            <Col xs md={12}>
              <div style={{ textAlign: 'center' }}>Player 2 Select</div>
            </Col>
          </Row>
          <Row>
            <Col xs md={12}>
              <div className='dojo-selection'>
                <MyFightingMons
                  mons={otherPlayerMons}
                  setFightChoiceFunc={setFightChoice2Func}
                  account={otherPlayer}
                  choice='2'
                />
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  )
}

export default Room
