import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Table } from 'react-bootstrap'
import { Lokimon } from '../../models'
import MyFightingMons from './myFightingMons'
import { breedOption } from '../common'
import getAccount from '../../utils/getAccount'
import GenericModal from '../common/genericModal'
import { toast } from 'react-toastify'
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
  onOtherPlayerReady,
  acceptedAndReadyPlayer,
}) => {
  let navigate = useNavigate()

  const [otherPlayer, setOtherPlayer] = useState(null)
  const [otherPlayerMons, setOtherPlayerMons] = useState(null)
  const [creatorMons, setCreatorMons] = useState(null)
  const [_account, set_Account] = useState(account)

  useEffect(() => {
    let mounted = true
    if (!account && mounted) {
      ;(async () => {
        const acct = await getAccount()
        set_Account(acct)
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
  const handleShow = () => setShow(true)

  const handleOtherPlayerReady = () => {
    if (!otherPlayer) {
      toast.error('Missing player', {
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
      })
      return
    }

    onOtherPlayerReady(room, otherPlayer)

    setOtherPlayerReady((current) => !current)
    setDisableBtn(true)
  }

  useEffect(() => {
    console.log('other player is ready: ', otherPlayerReady)
  }, [otherPlayerReady])

  useEffect(() => {
    let mounted = true
    if (!disconConfirm) return

    if (mounted) {
      onDisconnect(null)
      navigate('/arena', { state: { room, leaver: account } })
    }

    return () => {
      mounted = false
    }
  }, [disconConfirm])

  const genericModalProps = {
    show,
    handleClose: (state: boolean) => handleClose(state),
    title: 'Disconnect',
    content: 'Are you sure ? This room will be disbanded or disconnected.',
  }

  const handleStartState = () => {
    alert('start fight, get choices to fight func in contract')
    setDisableBtn(false)
  }

  return (
    <div className="room-container">
      <div className="p1-arena green-glow">Room {room?.room}</div>
      <GenericModal {...genericModalProps} />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {' '}
        <button disabled={disableBtn} className="rpgui-button" type="button" onClick={() => handleShow()}>
          {room?.creator === account ? 'Disband' : 'Disconnect'}
        </button>{' '}
        {_account === otherPlayer && (
          <button
            className="rpgui-button"
            type="button"
            onClick={() => {
              console.log('ready')
              handleOtherPlayerReady()
            }}
          >
            {otherPlayerReady ? 'Waiting for start' : 'Ready'}
          </button>
        )}
        {(_account === room?.creator) && acceptedAndReadyPlayer ? (
          <button
            className="rpgui-button"
            type="button"
            onClick={() => {
              console.log('start or wait')
              handleStartState()
            }}
          >
            Start fight!
          </button>
        ) : (
          ''
        )}
      </div>

      {/* upper isle */}
      <div className="rpgui-container framed-grey vs-container" style={{ marginTop: '24px' }}>
        <Container fluid>
          <Row>
            <Col xs md="12" className="col-text-center">
              Selected Lokimon
            </Col>
            <Col xs="12" lg="12" className="col-text-center">
              <span>
                {monNames[cryptomons.find((mon: Lokimon) => mon.id?.toString() === fightChoice1?.toString())?.species]}{' '}
                {fightChoice1 ? `no.${fightChoice1}` : fightChoice1 == '0' ? `no.${0}` : ''}
              </span>
            </Col>
            <Col xs="12" lg="12" className="col-text-center">
              <span>
                {monNames[cryptomons.find((mon: Lokimon) => mon.id?.toString() === fightChoice2?.toString())?.species]}{' '}
                {fightChoice2 ? `no.${fightChoice2}` : ''}
              </span>
            </Col>
          </Row>
          <div className="dojo-spar-mons-img">
            {breedOption(parseInt(fightChoice1), cryptomons)}
            {breedOption(parseInt(fightChoice2), cryptomons)}
          </div>
        </Container>
      </div>

      {/* fight mons area, fight against area */}

      {_account === room?.creator && (
        <div className="rpgui-container framed-grey table-container">
          <Row>
            <Col xs md={12}>
              <div style={{ textAlign: 'center' }}>Player 1 Select</div>
            </Col>
          </Row>
          <Row>
            <Col xs md={12}>
              <div className="dojo-selection">
                <MyFightingMons
                  mons={creatorMons}
                  setFightChoiceFunc={setFightChoice1Func}
                  account={room?.creator}
                  choice="1"
                />
              </div>
            </Col>
          </Row>
        </div>
      )}

      {_account === otherPlayer && (
        <div className="rpgui-container framed-grey table-container">
          <Row>
            <Col xs md={12}>
              <div style={{ textAlign: 'center' }}>Player 2 Select</div>
            </Col>
          </Row>
          <Row>
            <Col xs md={12}>
              <div className="dojo-selection">
                <MyFightingMons
                  mons={otherPlayerMons}
                  setFightChoiceFunc={setFightChoice2Func}
                  account={otherPlayer}
                  choice="2"
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
