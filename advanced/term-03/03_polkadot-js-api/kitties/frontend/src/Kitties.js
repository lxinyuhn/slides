import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'

export default function Kitties (props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')

  const [dna, setDna] = useState([])
  const [owner, setOwner] = useState([])

  const fetchKitties = () => {
    // TODO: 在这里调用 `api.query.kittiesModule.*` 函数去取得猫咪的信息。
    // 你需要取得：
    //   - 共有多少只猫咪
    //   - 每只猫咪的主人是谁
    //   - 每只猫咪的 DNA 是什么，用来组合出它的形态
    console.log("fetchKitties:")
    let unsubscribe
    api.query.kittiesModule.kittiesCount(newValue => {

      if (newValue.isNone) {
        console.log("kitties: None")
      } else {
        const count = newValue.unwrap().toNumber();
        console.log("kitties count:", newValue, count);        
        const range = []
        for (let i=0; i<count; i++){
          range.push(i)
        }
        console.log("range:", range)
        let syncDna, syncOwner = false

        const queryDetail = async () =>{ 
          const unsub = await api.query.kittiesModule.kitties.multi(range, (dna) => {
            setDna(dna)

          });   
          const unsub2 = await api.query.kittiesModule.owner.multi(range, (owner) => {
            setOwner(owner)
          });         
        }
        queryDetail()
      }
    }).catch(console.error)

    return () => unsubscribe && unsubscribe()
  }

  const populateKitties = () => {
    // TODO: 在这里添加额外的逻辑。你需要组成这样的数组结构：
    //  ```javascript
    //  const kitties = [{
    //    id: 0,
    //    dna: ...,
    //    owner: ...
    //  }, { id: ..., dna: ..., owner: ... }]
    //  ```
    // 这个 kitties 会传入 <KittyCards/> 然后对每只猫咪进行处理
    console.log("populateKitties:", dna.length, owner.length)
    if (dna.length === 0 || owner.length === 0 || dna.length != owner.length){
      return
    }
    const kitties = [dna.length]
    for (let i=0; i<dna.length; i++){
      kitties[i]={
        id: i,
        dna: dna[i].unwrap(),
        owner: String(owner[i].unwrap())
      }
    }
    // const kitties = []
    setKitties(kitties)
  }

  useEffect(fetchKitties, [api, keyring])
  useEffect(populateKitties, [owner, dna])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kittiesModule',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
