import react, {FC, useState, useEffect} from 'react'

import './Container.css'
import {IPokemon, IEv} from './Pokemon'
import axios from 'axios'
import Searchbar from './Searchbar'
import Pokedex from './Pokedex'
import logo from '../img/pokeapi-logo.png'



export interface IPokemons{
  count: number,
  next: string | null,
  previous: string | null,
  results: {
    name: string,
    url: string
  }[],
}



const Container:FC = () => {
    const [pokemons, setPokemons] = useState<IPokemon[]>([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [searching, setSearching] = useState(false);

    //Math.floor((parseInt(data.id)-1)/3)+1
    const fetchPokemons = async () => {
      try {
        setLoading(true);
        let url = `${process.env.REACT_APP_API_URL}?limit=${21}&offset=${21*page}`;
        const response = await axios(url);
        const data:IPokemons = await response.data;
        let idFam:number = 1;

        const responseEv = await axios(`https://pokeapi.co/api/v2/evolution-chain/`);
        let dataEv:{} = await response.data.chain; 
        
        const promises = data.results.map(async (pokemon) => {

          const response = await axios(pokemon.url);
          const data:IPokemon = await response.data;
          const responsespecies = await axios(data.species.url);
          const dataspecies = await responsespecies.data;
          const ev_chainresponse = await axios(dataspecies.evolution_chain.url);
          const ev_chaindata = await ev_chainresponse.data;
          data.evolution = ev_chaindata.chain;
          
          return data;
        });
        const results = await Promise.all(promises);
        setPokemons(results);
        setLoading(false);
        setTotal(Math.ceil(data.count / 20));
        setNotFound(false);
      } catch (err) {}
    };

    const letsee = (pokemon:string) => {

    }
  

    useEffect(() => {
      if (!searching) {
        fetchPokemons();
      }
    }, [page]);

    const onSearch = async (pokemon: string) => {
        if (!pokemon) {
            return fetchPokemons();
        }
        setLoading(true);
        setNotFound(false);
        setSearching(true);
        let url = `${process.env.REACT_APP_API_URL}/${pokemon.toLowerCase()}`;
        try {
          const response = await axios.get(url)
          const result:IPokemon = await response.data;
          if (!result) {
              setNotFound(true);
              setLoading(false);
              return;
          } else {
              setPokemons([result]);
              setPage(0);
              setTotal(1);
          }
          setLoading(false);
          setSearching(false);
        } catch (error) {
          console.error(error)
            setNotFound(true);
            setLoading(false);
            return;
        }
    };


    let imgUrl = logo;
    const prop = {
      loading:loading,
      page:page,
      setPage:setPage,
      total:total
    }
    return (
        <div>
            <nav>
                <div>
                  <img src={imgUrl} alt="pokeapi-logo" className="navbar-image" />
                </div>
            </nav>
          <div className="App">
            
            <Searchbar onSearch={onSearch} pagination={prop} />
            {notFound ? (
              <div className="not-found-text">
                🥺 NOT FOUND 🥺
              </div>
            ) : (
              <Pokedex
                loading={loading}
                pokemons={pokemons}
              />
            )}
          </div>
          {/* <Footer /> */}
        </div>
      
    );
}

export default Container;