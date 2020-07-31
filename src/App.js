import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import JSONPretty from 'react-json-pretty';
import 'react-json-pretty/themes/monikai.css';
import { Grid, TextField, Button, Paper, LinearProgress, CircularProgress } from '@material-ui/core';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

function App() {
  const [loading, setLoading] = useState(false);
  const localStoraegretrieve = localStorage.getItem('value');
  const localStorageEndpoints = localStorage.getItem('selectedEdnpoints');
  const parsedStoredEndpoints = localStorageEndpoints ? JSON.parse(localStorageEndpoints) : {
    ['/api/oauth2/v2/identity']: { queryParams: '?fields[user]=about,created,email,first_name,full_name,image_url,last_name,social_connections,thumb_url,url,vanity', required: true },
    ['/api/oauth2/v2/campaigns']: { queryParams: '?fields[campaign]=created_at,creation_name,discord_server_id,image_small_url,image_url,is_charged_immediately,is_monthly,is_nsfw,main_video_embed,main_video_url,one_liner,one_liner,patron_count,pay_per_name,pledge_url,published_at,summary,thanks_embed,thanks_msg,thanks_video_url,has_rss,has_sent_rss_notify,rss_feed_title,rss_artwork_url,patron_count,discord_server_id,google_analytics_id,earnings_visibility', required: false },
    ['/api/oauth2/v2/campaigns/{campaign_id}']: { queryParams: '?fields[campaign]=created_at,creation_name,discord_server_id,image_small_url,image_url,is_charged_immediately,is_monthly,_is_nswf,main_video_embed,main_video_url,one_liner,one_liner,patron_count,pay_per_name,pledge_url,published_at,summary,thanks_embed,thanks_msg,thanks_video_url', required: false },
    ['/api/oauth2/v2/campaigns/{campaign_id}/members']: { queryParams: '?include=currently_entitled_tiers,address&fields[member]=full_name,is_follower,last_charge_date,last_charge_status,lifetime_support_cents,currently_entitled_amount_cents,patron_status&fields[tier]=amount_cents,created_at,description,discord_role_ids,edited_at,patron_count,published,published_at,requires_shipping,title,url', required: false },
    ['/api/oauth2/v2/members/{id}']: { queryParams: '?include=address,currently_entitled_tiers,user&fields[member]=full_name,is_follower,email,last_charge_date,last_charge_status,lifetime_support_cents,patron_status,currently_entitled_amount_cents,pledge_relationship_start,will_pay_amount_cents&fields%5Btier%5D=title&fields%5Buser%5D=full_name,hide_pledges', required: false },
    ['/api/oauth2/v2/campaigns/{campaign_id}/posts']: { queryParams: '', required: false },
    ['/api/oauth2/v2/posts/{id}']: { queryParams: '', required: false },
  }
  const history = localStoraegretrieve ? JSON.parse(localStoraegretrieve) : {};
  const [code, setCode] = useState(undefined);
  const [data, setData] = useState({});
  const [id, setId] = useState(undefined);
  const [value, setValue] = useState({
    ...history,
    redirectURI: 'http://localhost:3000/',
  });
  const [patreonLink, setPatreonLink] = useState(encodeURI(`https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${value.clientID}&redirect_uri=${value.redirectURI}&scope=${' '}`))
  const [selectedEdnpoints, setSelectedEndpoints] = useState(parsedStoredEndpoints)
  const scopes = [
    'identity',
    'identity.memberships',
    'campaigns',
    'w:campaigns.webhook',
    'campaigns.members',
    'campaigns.members.address',
    'campaigns.posts',
    'campaigns.members[email]',
    'identity[email]'
  ]

  const endpoints = [
    '/api/oauth2/v2/identity',
    '/api/oauth2/v2/campaigns',
    '/api/oauth2/v2/campaigns/{campaign_id}',
    '/api/oauth2/v2/campaigns/{campaign_id}/members',
    '/api/oauth2/v2/members/{id}',
    '/api/oauth2/v2/campaigns/{campaign_id}/posts',
    '/api/oauth2/v2/posts/{id}'
  ]

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('code')) {
      const codeFromPatreon = params.get('code')
      setCode(codeFromPatreon)
      obtainUserDetails(codeFromPatreon)
    }
  }, [])

  useEffect(() => {
    let userSelectedScopes = ``
    scopes.map((scope) => {
      if (value[scope]) {
        userSelectedScopes = userSelectedScopes + ` ${scope}`
      }
    })
    setPatreonLink(
      encodeURI(`https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${value.clientID}&redirect_uri=${value.redirectURI}&scope=${userSelectedScopes}`)
    )
    localStorage.setItem('value', JSON.stringify(value))
  }, [value])

  useEffect(() => {
    localStorage.setItem('selectedEdnpoints', JSON.stringify(selectedEdnpoints))

  }, [selectedEdnpoints])


  const obtainUserDetails = async (codeFromPatreon) => {
    setLoading(true)
    let response = await axios({
      url: 'http://localhost:8080/',
      method: 'POST',
      data: {
        ...value,
        codeFromPatreon,
        endpoints: selectedEdnpoints
      }
    })
    setData(response.data)
    setLoading(false)
  }

  const handleFormInput = event => {
    let newObj = {}
    newObj[event.target.name] = event.target.value
    setValue({
      ...value,
      ...newObj
    })
  }

  const handleCheckboxInput = event => {
    let newObj = {}
    newObj[event.target.name] = event.target.checked
    setValue({
      ...value,
      ...newObj
    })
  }

  const handleEndpointInput = event => {
    if (event.target.checked) {
      setSelectedEndpoints({
        ...selectedEdnpoints,
        [event.target.name]: { ...selectedEdnpoints[event.target.name], required: true }
      })
    } else {
      setSelectedEndpoints({
        ...selectedEdnpoints,
        [event.target.name]: { ...selectedEdnpoints[event.target.name], required: false }
      })
    }
  }

  const handleEndpointParams = event => {
    setSelectedEndpoints({
      ...selectedEdnpoints,
      [event.target.name]: { ...selectedEdnpoints[event.target.name], queryParams: event.target.value }
    })
  }

  return (
    <div className="App">
      <Paper style={{ padding: '24px', margin: '24px' }}>
        <Grid container spacing={3} >
          <Grid item md={12}>
            <Typography variant='h5'>Patreon API Tool by OYKU</Typography>
          </Grid>
          <Grid item md={6}>
            <FormControl onChange={handleFormInput}
              onSubmit={(event) => {
                event.preventDefault()
              }}
              component="fieldset">
              <FormLabel component="legend">Enter details</FormLabel>
              <FormGroup>
                <TextField name='clientID' defaultValue={value.clientID} required label='Enter Client ID' />
                <TextField name='secretKey' defaultValue={value.secretKey} label='Secret Key' required />
                <TextField label='redirect URI' defaultValue={value.redirectURI} name='redirectURI' />
                <TextField name='campaignId' defaultValue={value.campaignId} label='Enter Campagin ID' />
                <TextField name='memberId' defaultValue={value.memberId} label='Enter Member ID' />
                <TextField name='postId' defaultValue={value.postId} label='Enter Post ID' />
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl component="fieldset" md={6}>
              <FormLabel component="legend">Select Scopes</FormLabel>
              <FormGroup>
                {scopes.map((scope) => <FormControlLabel
                  control={<Checkbox name={scope} defaultChecked={value[scope]} onChange={handleCheckboxInput} />}
                  label={scope}
                />
                )}
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item md={12}>
            <FormControl component="fieldset" style={{width:'100%'}}>
              <FormLabel component="legend">Select Endpoints</FormLabel>
              <FormGroup>
                {endpoints.map((endpoint) => <FormControlLabel
                  control={
                    <Grid container alignItems={'baseline'}>
                    <Grid item>
                    <Checkbox name={endpoint} defaultChecked={selectedEdnpoints[endpoint].required} onChange={handleEndpointInput} />
                    </Grid>
                    <Grid item>
                   <Typography>{endpoint}</Typography>
                    </Grid>
                  <Grid item md={6}>
                  <TextField
                    name={endpoint}
                    onChange={handleEndpointParams}
                    defaultValue={selectedEdnpoints[endpoint].queryParams}
                    fullWidth
                     />
                       </Grid>
                       </Grid>}
                  
                />
                )}
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item md={12} style={{ display: 'flex', justifyContent: 'center' }}>
            <a href={patreonLink} style={{ textDecoration: 'none' }}>
              <Button variant='contained' color='secondary' style={{ margin: '10px' }}>
                Log in with Patreon
        </Button>
            </a>
            <a href={'/'} style={{ textDecoration: 'none' }}>
              <Button variant='contained' color='secondary' style={{ margin: '10px' }} onClick={() => localStorage.clear()}>
                Reset
      </Button>
            </a>
          </Grid>
        </Grid>
      </Paper>
      <Paper style={{ padding: '24px', margin: '24px' }}>
        <Grid container spacing={3} >
          <Grid item>
            <Typography variant='h5'>Output</Typography>
          </Grid>
          {loading && <Grid item md={12} style={{ display: 'flex', justifyContent: 'center' }}><CircularProgress color="secondary" /></Grid>}
          <Grid item md={12}>
            {data && Object.entries(data).map(([key, value]) => {
              return (
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography >{key}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <JSONPretty id="json-pretty" data={value} style={{ textAlign: 'justify', margin: '10px', }}></JSONPretty>
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}

export default App;
