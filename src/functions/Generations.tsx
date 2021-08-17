import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { ClassNameMap } from '@material-ui/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
 
 

import { useQuery, useMutation, gql } from '@apollo/client';
import { GENERATIONS } from '../graphql/queries';
import { REQUESTGENERATION } from '../graphql/mutations';


// Generation type definition
type Generation = {
    id: string,
    title: string,
    filename: string,
    generationTimeStart: Date,
    generationTimeEnd: Date,
    fileSize: number,
    lineCountBefore: number,
    lineCountAfter: number,
    hasText: boolean,
    usedGenerator: string,
    actualData: boolean,
    recipientsNum: number,
    isPublic: boolean,
}

//  CSS styles for material-ui
const useStyles = makeStyles((theme) => ({
  messagePaper: {
    marginTop: '1rem',
    padding: '1rem',
  },
  grid: {
    marginTop: '1rem',
    padding: '1rem',
  },
}));

//  Paper object to show messages about generations operations to the user
function messagePaper(message: string, classes: ClassNameMap, color: any) {
  return (<Paper elevation={3} className={classes.messagePaper}><Typography variant="h6" align="center" color={color}>{message}</Typography></Paper>);
}

//  Formats the date to the dd-MM-YY format
function formatDate(generationTimeStart: Date) {
  const date = new Date(generationTimeStart);
  return date.getDay()+'. '+(date.getMonth()+1)+'. '+date.getFullYear();
}

//  Process and returns the display for the generation performance data
function insightMode(generation: Generation) {
  if (generation.generationTimeEnd === null){
    return;
  }
  const generationTimeStart = new Date(generation.generationTimeStart);
  const generationTimeEnd = new Date(generation.generationTimeEnd);

  const secondsSpent = ((generationTimeEnd.getTime()-generationTimeStart.getTime())/1000)%60;
  return (
    <div>
      <p><strong>Generator:</strong> {generation.usedGenerator}</p>
      <p><strong>Velikost:</strong> {(generation.fileSize)/1024/1024} MiB</p>
      <p><strong>Število vrstic (optimizirano):</strong> {generation.lineCountAfter} (od tega odstranjeno: {(generation.lineCountBefore)-(generation.lineCountAfter)})</p>
      <p><strong>Čas generacije:</strong> {secondsSpent}</p>
      <p><strong>Vključena besedilna verzija:</strong> {generation.hasText ? "Da" : "Ne"}</p>
      <p><strong>API kot vir podatkov:</strong> {generation.actualData ? "Da" : "Ne"}</p>
      <p><strong>Število prejemnikov glasila:</strong> {generation.recipientsNum}</p>
      <p><strong>Objavljen:</strong> {generation.isPublic ? "Da" : "Ne"}</p>
    </div>
  );
}

function insightMutations(displayMutations: boolean, handleChange: any, handleSubmit: any, formData: any) {
  if (!displayMutations) return;
  return (
    <Grid item>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="requestgeneration-content"
          id="requestgeneration-header"
        >
          <Typography>Request a manual generation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <form noValidate autoComplete="off">
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm='auto'>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Generator</FormLabel>
                  <RadioGroup aria-label="generator" name="generator" value={formData.generator} onChange={handleChange}>
                    <FormControlLabel value="Maizzle" control={<Radio />} label="Maizzle" />
                    <FormControlLabel value="mjml" control={<Radio />} label="mjml" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm='auto'>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Send the email</FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox onChange={handleChange} name="send" id="send" />}
                      label="Send the email!"
                    />
                  </FormGroup>
                </FormControl>
              </Grid>
              <Grid item>
                <Button color="inherit" onClick={handleSubmit} type="submit" variant="outlined">Request</Button>
              </Grid>
            </Grid>
          </form>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}

//  requestGeneration form initial state
const initialFormData = Object.freeze({
  generator: 'Maizzle',
  send: false,
});

//  Generations component function
function Generations() {
  const classes = useStyles();

  //  Form data handler
  const [formData, updateFormData] = React.useState(initialFormData);

  //  Apollo graphql query and mutation hooks
  const { loading: queryLoading, error: queryError, data, startPolling } = useQuery(GENERATIONS);
  const [requestGeneration, { error: requestGenerationError }] = useMutation(REQUESTGENERATION, {
    onError: (error) => {},
    update(cache, { data: { requestGeneration } }) {
      cache.modify({
        fields: {
          generations(existingGenerations = []) {
            const newGenerationRef = cache.writeFragment({
              data: requestGeneration,
              fragment: gql`
                fragment NewGeneration on Generation {
                  id
                  title
                  filename
                  generationTimeStart
                  generationTimeEnd
                  fileSize
                  lineCountBefore
                  lineCountAfter
                  hasText
                  usedGenerator
                  actualData
                  recipientsNum
                  isPublic
                }
              `
            });
            return [...existingGenerations, newGenerationRef];
          }
        }
      });
    }
  });

  startPolling(300000);

  //Handle form change
  function handleChange(e: any) {
    if (e.target.name === 'generator'){
      updateFormData({
        ...formData,
        [e.target.name]: e.target.value.trim()
      });
    }
    if (e.target.name === 'send'){
      updateFormData({
        ...formData,
        [e.target.name]: e.target.checked
      });
    }
  };

  //Handle form submit
  function handleSubmit(e: any) {
    e.preventDefault();
    requestGeneration({ variables: { generator: formData.generator, send: formData.send } });
  };

  //  Generations query loading and error statuses
  if (queryLoading) return (messagePaper(`Loading . . .`, classes, 'primary'));
  if (queryError) return (messagePaper(`Error: ${queryError.message}`, classes, 'error'));

  //  Insight mode mutation
  const displayMutations = data.generations[0].generationTimeEnd ? true : false;

  //  Operation user messages logic
  let message;
  
  if (requestGenerationError) {
    //  requestGeneration mutation error reporting
    message = messagePaper(requestGenerationError.message, classes, 'error');
  }

  return (
    <div>
      {{message} && <div>{message}</div>}
      <div>
        <Grid container spacing={3} className={classes.grid}>
          <Grid item xs={12} sm={4}>
            <img width="240px" src="https://friint.fri1.uni-lj.si/upload/IT%20infrastruktura/tricol/fri_logo.png" alt="Logo" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h2" align="center">
              <p><strong>JUTRANJIK</strong></p>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
          </Grid>
        </Grid>
        <Grid container className={classes.grid}>
          <Grid item xs={12}>
            {insightMutations(displayMutations, handleChange, handleSubmit, formData)}
          </Grid>
        </Grid>
        <Grid container spacing={3} className={classes.grid}>
          {data.generations.slice(0).reverse().map((generation: Generation) => (
            <Grid item xs={12} sm={6} key={generation.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    <p><strong>{generation.title}</strong></p>
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    <p><strong>Ustvarjen:</strong> {formatDate(generation.generationTimeStart)}</p>
                    {insightMode(generation)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Grid container justifyContent="flex-end">
                    <Grid item>
                      <Button variant="text" href={'generations/'+generation.filename+".html"}>Ogled glasila</Button>
                    </Grid>
                  </Grid>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

export default Generations;