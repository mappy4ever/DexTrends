/**
 * API mocking utilities for testing to prevent hitting real APIs
 */
import { Page } from '@playwright/test';
import { MOCK_POKEMON_DATA, MOCK_SPECIES_DATA } from './mock-api-data';

export class ApiMocker {
  constructor(private page: Page) {}

  /**
   * Mock all PokeAPI calls to prevent hitting real API during tests
   */
  async mockPokeAPI(): Promise<void> {
    // Mock Pokemon data endpoints
    await this.page.route('**/api/v2/pokemon/*', async (route) => {
      const url = route.request().url();
      
      // Extract Pokemon ID from URL
      const pokemonMatch = url.match(/\/pokemon\/(\d+)\/?$/);
      if (pokemonMatch) {
        const id = parseInt(pokemonMatch[1]);
        const mockData = MOCK_POKEMON_DATA[id];
        
        if (mockData) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockData)
          });
          return;
        }
      }
      
      // Extract ID from URL path for fallback
      const idMatch = url.match(/\/pokemon\/(\d+)\/?$/);
      const fallbackId = idMatch ? parseInt(idMatch[1]) : 1;
      
      // Fallback for unmocked Pokemon
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: fallbackId,
          name: `test-pokemon-${fallbackId}`,
          height: 10,
          weight: 100,
          types: [{ type: { name: "normal" } }],
          sprites: { front_default: "/test.png", other: { "official-artwork": { front_default: "/test.png" } } },
          stats: [
            { base_stat: 50, stat: { name: "hp" } },
            { base_stat: 50, stat: { name: "attack" } },
            { base_stat: 50, stat: { name: "defense" } },
            { base_stat: 50, stat: { name: "special-attack" } },
            { base_stat: 50, stat: { name: "special-defense" } },
            { base_stat: 50, stat: { name: "speed" } }
          ],
          abilities: [{ ability: { name: "test" }, is_hidden: false }],
          species: { url: `https://pokeapi.co/api/v2/pokemon-species/${fallbackId}/` }
        })
      });
    });

    // Mock Pokemon species data endpoints
    await this.page.route('**/api/v2/pokemon-species/*', async (route) => {
      const url = route.request().url();
      
      const speciesMatch = url.match(/\/pokemon-species\/(\d+)\/?$/);
      if (speciesMatch) {
        const id = parseInt(speciesMatch[1]);
        const mockData = MOCK_SPECIES_DATA[id];
        
        if (mockData) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockData)
          });
          return;
        }
      }
      
      // Extract ID from URL for fallback
      const speciesIdMatch = url.match(/\/pokemon-species\/(\d+)\/?$/);
      const fallbackSpeciesId = speciesIdMatch ? parseInt(speciesIdMatch[1]) : 1;
      
      // Fallback species data
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: fallbackSpeciesId,
          name: `test-pokemon-${fallbackSpeciesId}`,
          is_legendary: false,
          is_mythical: false,
          evolution_chain: { url: `https://pokeapi.co/api/v2/evolution-chain/${fallbackSpeciesId}/` },
          genera: [{ genus: "Test Pokémon", language: { name: "en" } }],
          egg_groups: [{ name: "monster", url: "https://pokeapi.co/api/v2/egg-group/1/" }],
          gender_rate: 4,
          generation: { name: "generation-i", url: "https://pokeapi.co/api/v2/generation/1/" }
        })
      });
    });

    // Mock other PokeAPI endpoints that might be called
    await this.page.route('**/api/v2/evolution-chain/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          chain: {
            species: { name: "test-pokemon" },
            evolves_to: []
          }
        })
      });
    });

    // Mock ability endpoints
    await this.page.route('**/api/v2/ability/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: "test-ability",
          effect_entries: [
            { effect: "Test ability effect", language: { name: "en" } }
          ]
        })
      });
    });

    // Mock Pokemon list endpoint
    await this.page.route('**/api/v2/pokemon?limit=*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 1025,
          results: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
            { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
            { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
            { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon/5/' },
            { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
            { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' },
            { name: 'wartortle', url: 'https://pokeapi.co/api/v2/pokemon/8/' },
            { name: 'blastoise', url: 'https://pokeapi.co/api/v2/pokemon/9/' },
            { name: 'caterpie', url: 'https://pokeapi.co/api/v2/pokemon/10/' },
            { name: 'metapod', url: 'https://pokeapi.co/api/v2/pokemon/11/' },
            { name: 'butterfree', url: 'https://pokeapi.co/api/v2/pokemon/12/' },
            { name: 'weedle', url: 'https://pokeapi.co/api/v2/pokemon/13/' },
            { name: 'kakuna', url: 'https://pokeapi.co/api/v2/pokemon/14/' },
            { name: 'beedrill', url: 'https://pokeapi.co/api/v2/pokemon/15/' },
            { name: 'pidgey', url: 'https://pokeapi.co/api/v2/pokemon/16/' },
            { name: 'pidgeotto', url: 'https://pokeapi.co/api/v2/pokemon/17/' },
            { name: 'pidgeot', url: 'https://pokeapi.co/api/v2/pokemon/18/' },
            { name: 'rattata', url: 'https://pokeapi.co/api/v2/pokemon/19/' },
            { name: 'raticate', url: 'https://pokeapi.co/api/v2/pokemon/20/' },
            { name: 'spearow', url: 'https://pokeapi.co/api/v2/pokemon/21/' },
            { name: 'fearow', url: 'https://pokeapi.co/api/v2/pokemon/22/' },
            { name: 'ekans', url: 'https://pokeapi.co/api/v2/pokemon/23/' },
            { name: 'arbok', url: 'https://pokeapi.co/api/v2/pokemon/24/' },
            { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }
          ]
        })
      });
    });

    // Mock nature list endpoint (with or without query params)
    await this.page.route('**/api/v2/nature*', async (route) => {
      const url = route.request().url();
      
      // If it's a specific nature ID, handle it differently
      if (url.match(/\/nature\/\d+\/?$/)) {
        return; // Let the specific nature handler below handle this
      }
      
      // Return nature list
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 25,
          results: [
            { name: 'hardy', url: 'https://pokeapi.co/api/v2/nature/1/' },
            { name: 'lonely', url: 'https://pokeapi.co/api/v2/nature/2/' },
            { name: 'brave', url: 'https://pokeapi.co/api/v2/nature/3/' },
            { name: 'adamant', url: 'https://pokeapi.co/api/v2/nature/4/' },
            { name: 'naughty', url: 'https://pokeapi.co/api/v2/nature/5/' },
            { name: 'bold', url: 'https://pokeapi.co/api/v2/nature/6/' },
            { name: 'docile', url: 'https://pokeapi.co/api/v2/nature/7/' },
            { name: 'relaxed', url: 'https://pokeapi.co/api/v2/nature/8/' },
            { name: 'impish', url: 'https://pokeapi.co/api/v2/nature/9/' },
            { name: 'lax', url: 'https://pokeapi.co/api/v2/nature/10/' },
            { name: 'timid', url: 'https://pokeapi.co/api/v2/nature/11/' },
            { name: 'hasty', url: 'https://pokeapi.co/api/v2/nature/12/' },
            { name: 'serious', url: 'https://pokeapi.co/api/v2/nature/13/' },
            { name: 'jolly', url: 'https://pokeapi.co/api/v2/nature/14/' },
            { name: 'naive', url: 'https://pokeapi.co/api/v2/nature/15/' },
            { name: 'modest', url: 'https://pokeapi.co/api/v2/nature/16/' },
            { name: 'mild', url: 'https://pokeapi.co/api/v2/nature/17/' },
            { name: 'quiet', url: 'https://pokeapi.co/api/v2/nature/18/' },
            { name: 'bashful', url: 'https://pokeapi.co/api/v2/nature/19/' },
            { name: 'rash', url: 'https://pokeapi.co/api/v2/nature/20/' },
            { name: 'calm', url: 'https://pokeapi.co/api/v2/nature/21/' },
            { name: 'gentle', url: 'https://pokeapi.co/api/v2/nature/22/' },
            { name: 'sassy', url: 'https://pokeapi.co/api/v2/nature/23/' },
            { name: 'careful', url: 'https://pokeapi.co/api/v2/nature/24/' },
            { name: 'quirky', url: 'https://pokeapi.co/api/v2/nature/25/' }
          ]
        })
      });
    });

    // Mock type endpoints - MUST be before catch-all
    await this.page.route('**/api/v2/type/*', async (route) => {
      const url = route.request().url();
      const typeMatch = url.match(/\/type\/([a-z]+)\/?$/);
      
      if (typeMatch) {
        const typeName = typeMatch[1];
        
        // Mock type data with proper damage relations
        const typeData = {
          name: typeName,
          damage_relations: {
            double_damage_to: [],
            half_damage_to: [],
            no_damage_to: [],
            double_damage_from: [],
            half_damage_from: [],
            no_damage_from: []
          },
          pokemon: [], // Empty array to prevent slice error
          moves: [],   // Empty array to prevent slice error
          generation: { name: 'generation-i', url: 'https://pokeapi.co/api/v2/generation/1/' }
        };
        
        // Add some basic type effectiveness relationships
        // Default to normal type with basic relationships if not specifically defined
        if (typeName === 'normal') {
          typeData.damage_relations.half_damage_from = [
            { name: 'normal', url: 'https://pokeapi.co/api/v2/type/normal/' }
          ];
          typeData.damage_relations.double_damage_from = [
            { name: 'fighting', url: 'https://pokeapi.co/api/v2/type/fighting/' }
          ];
          typeData.damage_relations.no_damage_from = [
            { name: 'ghost', url: 'https://pokeapi.co/api/v2/type/ghost/' }
          ];
          typeData.damage_relations.half_damage_to = [
            { name: 'rock', url: 'https://pokeapi.co/api/v2/type/rock/' },
            { name: 'steel', url: 'https://pokeapi.co/api/v2/type/steel/' }
          ];
          typeData.damage_relations.no_damage_to = [
            { name: 'ghost', url: 'https://pokeapi.co/api/v2/type/ghost/' }
          ];
        } else if (typeName === 'fire') {
          typeData.damage_relations.double_damage_to = [
            { name: 'grass', url: 'https://pokeapi.co/api/v2/type/grass/' },
            { name: 'ice', url: 'https://pokeapi.co/api/v2/type/ice/' },
            { name: 'bug', url: 'https://pokeapi.co/api/v2/type/bug/' },
            { name: 'steel', url: 'https://pokeapi.co/api/v2/type/steel/' }
          ];
          typeData.damage_relations.half_damage_to = [
            { name: 'fire', url: 'https://pokeapi.co/api/v2/type/fire/' },
            { name: 'water', url: 'https://pokeapi.co/api/v2/type/water/' },
            { name: 'rock', url: 'https://pokeapi.co/api/v2/type/rock/' },
            { name: 'dragon', url: 'https://pokeapi.co/api/v2/type/dragon/' }
          ];
          typeData.damage_relations.double_damage_from = [
            { name: 'water', url: 'https://pokeapi.co/api/v2/type/water/' },
            { name: 'ground', url: 'https://pokeapi.co/api/v2/type/ground/' },
            { name: 'rock', url: 'https://pokeapi.co/api/v2/type/rock/' }
          ];
          typeData.damage_relations.half_damage_from = [
            { name: 'fire', url: 'https://pokeapi.co/api/v2/type/fire/' },
            { name: 'grass', url: 'https://pokeapi.co/api/v2/type/grass/' },
            { name: 'ice', url: 'https://pokeapi.co/api/v2/type/ice/' },
            { name: 'bug', url: 'https://pokeapi.co/api/v2/type/bug/' },
            { name: 'steel', url: 'https://pokeapi.co/api/v2/type/steel/' },
            { name: 'fairy', url: 'https://pokeapi.co/api/v2/type/fairy/' }
          ];
        } else if (typeName === 'water') {
          typeData.damage_relations.double_damage_to = [
            { name: 'fire', url: 'https://pokeapi.co/api/v2/type/fire/' },
            { name: 'ground', url: 'https://pokeapi.co/api/v2/type/ground/' },
            { name: 'rock', url: 'https://pokeapi.co/api/v2/type/rock/' }
          ];
          typeData.damage_relations.half_damage_to = [
            { name: 'water', url: 'https://pokeapi.co/api/v2/type/water/' },
            { name: 'grass', url: 'https://pokeapi.co/api/v2/type/grass/' },
            { name: 'dragon', url: 'https://pokeapi.co/api/v2/type/dragon/' }
          ];
          typeData.damage_relations.double_damage_from = [
            { name: 'grass', url: 'https://pokeapi.co/api/v2/type/grass/' },
            { name: 'electric', url: 'https://pokeapi.co/api/v2/type/electric/' }
          ];
          typeData.damage_relations.half_damage_from = [
            { name: 'fire', url: 'https://pokeapi.co/api/v2/type/fire/' },
            { name: 'water', url: 'https://pokeapi.co/api/v2/type/water/' },
            { name: 'ice', url: 'https://pokeapi.co/api/v2/type/ice/' },
            { name: 'steel', url: 'https://pokeapi.co/api/v2/type/steel/' }
          ];
        } else if (typeName === 'grass') {
          typeData.damage_relations.double_damage_to = [
            { name: 'water', url: 'https://pokeapi.co/api/v2/type/water/' },
            { name: 'ground', url: 'https://pokeapi.co/api/v2/type/ground/' },
            { name: 'rock', url: 'https://pokeapi.co/api/v2/type/rock/' }
          ];
          typeData.damage_relations.half_damage_to = [
            { name: 'fire', url: 'https://pokeapi.co/api/v2/type/fire/' },
            { name: 'grass', url: 'https://pokeapi.co/api/v2/type/grass/' },
            { name: 'poison', url: 'https://pokeapi.co/api/v2/type/poison/' },
            { name: 'flying', url: 'https://pokeapi.co/api/v2/type/flying/' },
            { name: 'bug', url: 'https://pokeapi.co/api/v2/type/bug/' },
            { name: 'dragon', url: 'https://pokeapi.co/api/v2/type/dragon/' },
            { name: 'steel', url: 'https://pokeapi.co/api/v2/type/steel/' }
          ];
          typeData.damage_relations.double_damage_from = [
            { name: 'fire', url: 'https://pokeapi.co/api/v2/type/fire/' },
            { name: 'ice', url: 'https://pokeapi.co/api/v2/type/ice/' },
            { name: 'poison', url: 'https://pokeapi.co/api/v2/type/poison/' },
            { name: 'flying', url: 'https://pokeapi.co/api/v2/type/flying/' },
            { name: 'bug', url: 'https://pokeapi.co/api/v2/type/bug/' }
          ];
          typeData.damage_relations.half_damage_from = [
            { name: 'water', url: 'https://pokeapi.co/api/v2/type/water/' },
            { name: 'grass', url: 'https://pokeapi.co/api/v2/type/grass/' },
            { name: 'electric', url: 'https://pokeapi.co/api/v2/type/electric/' },
            { name: 'ground', url: 'https://pokeapi.co/api/v2/type/ground/' }
          ];
        } else if (typeName === 'ghost') {
          typeData.damage_relations.double_damage_to = [
            { name: 'ghost', url: 'https://pokeapi.co/api/v2/type/ghost/' },
            { name: 'psychic', url: 'https://pokeapi.co/api/v2/type/psychic/' }
          ];
          typeData.damage_relations.no_damage_to = [
            { name: 'normal', url: 'https://pokeapi.co/api/v2/type/normal/' }
          ];
          typeData.damage_relations.half_damage_to = [
            { name: 'dark', url: 'https://pokeapi.co/api/v2/type/dark/' }
          ];
          typeData.damage_relations.double_damage_from = [
            { name: 'ghost', url: 'https://pokeapi.co/api/v2/type/ghost/' },
            { name: 'dark', url: 'https://pokeapi.co/api/v2/type/dark/' }
          ];
          typeData.damage_relations.no_damage_from = [
            { name: 'normal', url: 'https://pokeapi.co/api/v2/type/normal/' },
            { name: 'fighting', url: 'https://pokeapi.co/api/v2/type/fighting/' }
          ];
          typeData.damage_relations.half_damage_from = [
            { name: 'poison', url: 'https://pokeapi.co/api/v2/type/poison/' },
            { name: 'bug', url: 'https://pokeapi.co/api/v2/type/bug/' }
          ];
        } else {
          // For any unmocked type, add some basic relationships
          typeData.damage_relations.double_damage_to = [
            { name: 'normal', url: 'https://pokeapi.co/api/v2/type/normal/' }
          ];
          typeData.damage_relations.half_damage_to = [
            { name: 'steel', url: 'https://pokeapi.co/api/v2/type/steel/' }
          ];
          typeData.damage_relations.double_damage_from = [
            { name: 'fighting', url: 'https://pokeapi.co/api/v2/type/fighting/' }
          ];
          typeData.damage_relations.half_damage_from = [
            { name: 'normal', url: 'https://pokeapi.co/api/v2/type/normal/' }
          ];
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(typeData)
        });
        return;
      }
      
      // Fallback for unmocked types
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Type not found' })
      });
    });

    // Mock nature detail endpoints
    await this.page.route('**/api/v2/nature/*/', async (route) => {
      const url = route.request().url();
      const natureId = parseInt(url.match(/\/nature\/(\d+)\/?$/)?.[1] || '1');
      
      const natures: Record<number, any> = {
        1: { id: 1, name: 'hardy', increased_stat: null, decreased_stat: null },
        2: { id: 2, name: 'lonely', increased_stat: { name: 'attack' }, decreased_stat: { name: 'defense' } },
        3: { id: 3, name: 'brave', increased_stat: { name: 'attack' }, decreased_stat: { name: 'speed' } },
        4: { id: 4, name: 'adamant', increased_stat: { name: 'attack' }, decreased_stat: { name: 'special-attack' } },
        5: { id: 5, name: 'naughty', increased_stat: { name: 'attack' }, decreased_stat: { name: 'special-defense' } },
        6: { id: 6, name: 'bold', increased_stat: { name: 'defense' }, decreased_stat: { name: 'attack' } },
        7: { id: 7, name: 'docile', increased_stat: null, decreased_stat: null },
        8: { id: 8, name: 'relaxed', increased_stat: { name: 'defense' }, decreased_stat: { name: 'speed' } },
        9: { id: 9, name: 'impish', increased_stat: { name: 'defense' }, decreased_stat: { name: 'special-attack' } },
        10: { id: 10, name: 'lax', increased_stat: { name: 'defense' }, decreased_stat: { name: 'special-defense' } },
        11: { id: 11, name: 'timid', increased_stat: { name: 'speed' }, decreased_stat: { name: 'attack' } },
        12: { id: 12, name: 'hasty', increased_stat: { name: 'speed' }, decreased_stat: { name: 'defense' } },
        13: { id: 13, name: 'serious', increased_stat: null, decreased_stat: null },
        14: { id: 14, name: 'jolly', increased_stat: { name: 'speed' }, decreased_stat: { name: 'special-attack' } },
        15: { id: 15, name: 'naive', increased_stat: { name: 'speed' }, decreased_stat: { name: 'special-defense' } },
        16: { id: 16, name: 'modest', increased_stat: { name: 'special-attack' }, decreased_stat: { name: 'attack' } },
        17: { id: 17, name: 'mild', increased_stat: { name: 'special-attack' }, decreased_stat: { name: 'defense' } },
        18: { id: 18, name: 'quiet', increased_stat: { name: 'special-attack' }, decreased_stat: { name: 'speed' } },
        19: { id: 19, name: 'bashful', increased_stat: null, decreased_stat: null },
        20: { id: 20, name: 'rash', increased_stat: { name: 'special-attack' }, decreased_stat: { name: 'special-defense' } },
        21: { id: 21, name: 'calm', increased_stat: { name: 'special-defense' }, decreased_stat: { name: 'attack' } },
        22: { id: 22, name: 'gentle', increased_stat: { name: 'special-defense' }, decreased_stat: { name: 'defense' } },
        23: { id: 23, name: 'sassy', increased_stat: { name: 'special-defense' }, decreased_stat: { name: 'speed' } },
        24: { id: 24, name: 'careful', increased_stat: { name: 'special-defense' }, decreased_stat: { name: 'special-attack' } },
        25: { id: 25, name: 'quirky', increased_stat: null, decreased_stat: null }
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(natures[natureId] || natures[1])
      });
    });

    // Mock move endpoints (both list and detail)
    await this.page.route('**/api/v2/move**', async (route) => {
      const url = route.request().url();
      
      // Check if it's a list request
      if (url.includes('?')) {
        const limit = parseInt(url.match(/limit=(\d+)/)?.[1] || '100');
        
        const results = [];
        for (let i = 1; i <= Math.min(limit, 1000); i++) {
          results.push({
            name: `test-move-${i}`,
            url: `https://pokeapi.co/api/v2/move/${i}/`
          });
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            count: 1000,
            next: limit < 1000 ? `https://pokeapi.co/api/v2/move?offset=${limit}&limit=${limit}` : null,
            previous: null,
            results
          })
        });
      } else {
        // Individual move detail
        const moveId = url.match(/\/move\/(\d+)\/?$/)?.[1] || '1';
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: parseInt(moveId),
            name: `test-move-${moveId}`,
            accuracy: 100,
            power: 60,
            pp: 20,
            priority: 0,
            damage_class: { name: 'physical' },
            type: { name: 'normal' },
            effect_entries: [{
              effect: 'Test move effect',
              short_effect: 'Test effect',
              language: { name: 'en' }
            }]
          })
        });
      }
    });

    // Note: Generic item endpoint removed - full URLs are handled below
    // (Removed duplicate item mocking route)

    // Mock move endpoints (both list and detail)
    await this.page.route('**/api/v2/move**', async (route) => {
      const url = route.request().url();
      
      // Check if it's a list request
      if (url.includes('?')) {
        const limit = parseInt(url.match(/limit=(\d+)/)?.[1] || '100');
        
        const results = [];
        for (let i = 1; i <= Math.min(limit, 300); i++) {
          results.push({
            name: `test-item-${i}`,
            url: `https://pokeapi.co/api/v2/item/${i}/`
          });
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            count: 300,
            next: limit < 300 ? `https://pokeapi.co/api/v2/item?offset=${limit}&limit=${limit}` : null,
            previous: null,
            results
          })
        });
      } else {
        // Individual item detail
        const itemId = url.match(/\/item\/(\d+)\/?$/)?.[1] || '1';
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: parseInt(itemId),
            name: `test-item-${itemId}`,
            cost: 100,
            category: { name: 'standard-balls' },
            effect_entries: [{
              effect: 'Test item effect',
              short_effect: 'Test effect',
              language: { name: 'en' }
            }],
            sprites: {
              default: '/test-item.png'
            }
          })
        });
      }
    });

    // Also mock the full PokeAPI URLs (for cases where relative paths aren't caught)
    await this.page.route('https://pokeapi.co/api/v2/item**', async (route) => {
      const url = route.request().url();
      
      // Check if it's a list request
      if (url.includes('?')) {
        const limit = parseInt(url.match(/limit=(\d+)/)?.[1] || '100');
        
        const results = [];
        const commonItems = ['potion', 'poke-ball', 'rare-candy', 'max-revive', 'master-ball', 'super-potion', 'hyper-potion', 'full-restore', 'revive', 'great-ball', 'ultra-ball'];
        
        // First add common items that tests expect
        for (let i = 0; i < Math.min(commonItems.length, limit); i++) {
          results.push({
            name: commonItems[i],
            url: `https://pokeapi.co/api/v2/item/${i + 1}/`
          });
        }
        
        // Then fill with additional test items
        for (let i = commonItems.length + 1; i <= Math.min(limit, 300); i++) {
          results.push({
            name: `test-item-${i}`,
            url: `https://pokeapi.co/api/v2/item/${i}/`
          });
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            count: Math.min(limit, 300),
            next: limit < 300 ? `https://pokeapi.co/api/v2/item?offset=${limit}&limit=${limit}` : null,
            previous: null,
            results: results
          })
        });
      } else {
        // Individual item detail
        const itemId = url.match(/\/item\/(\d+)\/?$/)?.[1] || '1';
        const commonItems = ['potion', 'poke-ball', 'rare-candy', 'max-revive', 'master-ball', 'super-potion', 'hyper-potion', 'full-restore', 'revive', 'great-ball', 'ultra-ball'];
        const itemIndex = parseInt(itemId) - 1;
        const itemName = itemIndex < commonItems.length ? commonItems[itemIndex] : `test-item-${itemId}`;
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: parseInt(itemId),
            name: itemName,
            cost: itemName.includes('ball') ? 200 : 100,
            category: { name: itemName.includes('ball') ? 'pokeballs' : 'other' },
            effect_entries: [{
              effect: `Test effect for ${itemName}`,
              language: { name: 'en' }
            }],
            sprites: {
              default: '/test-item.png'
            }
          })
        });
      }
    });

    // Mock full PokeAPI URLs for common endpoints that are causing hangs
    await this.page.route('https://pokeapi.co/api/v2/pokemon?limit=*', async (route) => {
      const url = route.request().url();
      const limit = parseInt(url.match(/limit=(\d+)/)?.[1] || '1025');
      
      const results = [];
      for (let i = 1; i <= Math.min(limit, 1025); i++) {
        results.push({
          name: `test-pokemon-${i}`,
          url: `https://pokeapi.co/api/v2/pokemon/${i}/`
        });
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: Math.min(limit, 1025),
          next: null,
          previous: null,
          results: results
        })
      });
    });

    await this.page.route('https://pokeapi.co/api/v2/move?limit=*', async (route) => {
      const url = route.request().url();
      const limit = parseInt(url.match(/limit=(\d+)/)?.[1] || '1000');
      
      const results = [];
      for (let i = 1; i <= Math.min(limit, 1000); i++) {
        results.push({
          name: `test-move-${i}`,
          url: `https://pokeapi.co/api/v2/move/${i}/`
        });
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: Math.min(limit, 1000),
          next: null,
          previous: null,
          results: results
        })
      });
    });

    await this.page.route('https://pokeapi.co/api/v2/ability?limit=*', async (route) => {
      const url = route.request().url();
      const limit = parseInt(url.match(/limit=(\d+)/)?.[1] || '350');
      
      const results = [];
      for (let i = 1; i <= Math.min(limit, 350); i++) {
        results.push({
          name: `test-ability-${i}`,
          url: `https://pokeapi.co/api/v2/ability/${i}/`
        });
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: Math.min(limit, 350),
          next: null,
          previous: null,
          results: results
        })
      });
    });

    await this.page.route('https://pokeapi.co/api/v2/type/*', async (route) => {
      const url = route.request().url();
      const typeId = url.match(/\/type\/(.+)\/?$/)?.[1] || 'normal';
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: typeId,
          damage_relations: {
            double_damage_to: [],
            double_damage_from: [],
            half_damage_to: [],
            half_damage_from: [],
            no_damage_to: [],
            no_damage_from: []
          },
          pokemon: []
        })
      });
    });

    await this.page.route('https://pokeapi.co/api/v2/nature**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 25,
          results: [
            { name: 'hardy', url: 'https://pokeapi.co/api/v2/nature/1/' },
            { name: 'lonely', url: 'https://pokeapi.co/api/v2/nature/2/' },
            { name: 'brave', url: 'https://pokeapi.co/api/v2/nature/3/' },
            { name: 'adamant', url: 'https://pokeapi.co/api/v2/nature/4/' },
            { name: 'naughty', url: 'https://pokeapi.co/api/v2/nature/5/' }
          ]
        })
      });
    });

    await this.page.route('https://pokeapi.co/api/v2/pokemon-species/*', async (route) => {
      const url = route.request().url();
      const speciesId = url.match(/\/pokemon-species\/(\d+)\/?$/)?.[1] || '1';
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: parseInt(speciesId),
          name: `test-species-${speciesId}`,
          evolution_chain: {
            url: `https://pokeapi.co/api/v2/evolution-chain/${speciesId}/`
          },
          flavor_text_entries: [
            {
              flavor_text: `Test flavor text for species ${speciesId}`,
              language: { name: 'en' }
            }
          ]
        })
      });
    });

    // Mock individual Pokemon detail calls from full URLs
    await this.page.route('https://pokeapi.co/api/v2/pokemon/*', async (route) => {
      const url = route.request().url();
      const pokemonId = url.match(/\/pokemon\/(\d+|[\w-]+)\/?$/)?.[1] || '1';
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: parseInt(pokemonId) || 1,
          name: `test-pokemon-${pokemonId}`,
          height: 10,
          weight: 100,
          types: [{ type: { name: "normal" } }],
          sprites: { front_default: "/test.png", other: { "official-artwork": { front_default: "/test.png" } } },
          stats: [
            { base_stat: 50, stat: { name: "hp" } },
            { base_stat: 50, stat: { name: "attack" } },
            { base_stat: 50, stat: { name: "defense" } },
            { base_stat: 50, stat: { name: "special-attack" } },
            { base_stat: 50, stat: { name: "special-defense" } },
            { base_stat: 50, stat: { name: "speed" } }
          ],
          abilities: [
            { ability: { name: "test-ability" }, is_hidden: false, slot: 1 }
          ],
          moves: [
            { move: { name: "test-move" }, version_group_details: [] }
          ]
        })
      });
    });

    // Mock move detail calls
    await this.page.route('https://pokeapi.co/api/v2/move/*', async (route) => {
      const url = route.request().url();
      const moveId = url.match(/\/move\/(\d+|[\w-]+)\/?$/)?.[1] || 'test-move';
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: parseInt(moveId) || 1,
          name: moveId,
          power: 80,
          accuracy: 100,
          pp: 15,
          type: { name: 'normal' },
          damage_class: { name: 'physical' },
          effect_entries: [
            { effect: 'Test move effect', language: { name: 'en' } }
          ]
        })
      });
    });

    // Mock berry endpoints
    await this.page.route('**/api/v2/berry/*', async (route) => {
      const url = route.request().url();
      const berryId = url.match(/\/berry\/(\d+)\/?$/)?.[1] || '1';
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: parseInt(berryId),
          name: `test-berry-${berryId}`,
          natural_gift_power: 60,
          natural_gift_type: { name: 'normal' },
          size: 20,
          max_harvest: 5,
          growth_time: 3,
          soil_dryness: 15,
          smoothness: 20,
          firmness: { name: 'soft' },
          flavors: []
        })
      });
    });

    // Mock ability endpoints (both list and detail)
    await this.page.route('**/api/v2/ability**', async (route) => {
      const url = route.request().url();
      
      // Check if it's a list request (has query params)
      if (url.includes('?')) {
        const limit = parseInt(url.match(/limit=(\d+)/)?.[1] || '200');
        
        const results = [];
        for (let i = 1; i <= Math.min(limit, 350); i++) {
          results.push({
            name: `test-ability-${i}`,
            url: `https://pokeapi.co/api/v2/ability/${i}/`
          });
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            count: 350,
            next: limit < 350 ? `https://pokeapi.co/api/v2/ability?offset=${limit}&limit=${limit}` : null,
            previous: null,
            results
          })
        });
      } else {
        // Individual ability detail
        const abilityId = url.match(/\/ability\/(\d+)\/?$/)?.[1] || '1';
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: parseInt(abilityId),
            name: `test-ability-${abilityId}`,
            effect_entries: [{
              effect: 'Test ability effect',
              language: { name: 'en' },
              short_effect: 'Test effect'
            }],
            pokemon: [
              { pokemon: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' } },
              { pokemon: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' } }
            ],
            generation: { name: 'generation-i' }
          })
        });
      }
    });

    // Note: Removed catch-all route to allow specific mocks to work properly
  }

  /**
   * Mock TCG API calls
   */
  async mockTCGAPI(): Promise<void> {
    // Mock set detail endpoints
    await this.page.route('**/api.pokemontcg.io/v2/sets/*', async (route) => {
      const url = route.request().url();
      console.log(`[TEST] Mocking TCG set request: ${url}`);
      
      const setId = url.match(/\/sets\/([^/?]+)/)?.[1] || 'base1';
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: setId,
          name: 'Base Set',
          series: 'Base',
          printedTotal: 102,
          total: 102,
          releaseDate: '1999-01-09',
          images: {
            symbol: 'https://images.pokemontcg.io/base1/symbol.png',
            logo: 'https://images.pokemontcg.io/base1/logo.png'
          }
        })
      });
    });
    
    // Mock cards endpoints
    await this.page.route('**/api.pokemontcg.io/v2/cards*', async (route) => {
      const url = route.request().url();
      console.log(`[TEST] Mocking TCG cards request: ${url}`);
      
      // Check if it's a specific card request
      const cardIdMatch = url.match(/\/cards\/([^/?]+)$/);
      if (cardIdMatch) {
        const cardId = cardIdMatch[1];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: cardId,
            name: 'Charizard',
            supertype: 'Pokémon',
            subtypes: ['Stage 2'],
            hp: '120',
            types: ['Fire'],
            number: '4',
            rarity: 'Rare Holo',
            images: {
              small: 'https://images.pokemontcg.io/base1/4.png',
              large: 'https://images.pokemontcg.io/base1/4_hires.png'
            },
            tcgplayer: {
              prices: {
                holofoil: {
                  low: 100.0,
                  mid: 200.0,
                  high: 500.0,
                  market: 250.0
                }
              }
            },
            set: {
              id: 'base1',
              name: 'Base Set'
            }
          })
        });
        return;
      }
      
      // Mock card list response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'base1-1',
              name: 'Alakazam',
              supertype: 'Pokémon',
              number: '1',
              rarity: 'Rare Holo',
              images: {
                small: 'https://images.pokemontcg.io/base1/1.png'
              },
              tcgplayer: {
                prices: {
                  holofoil: {
                    market: 50.0
                  }
                }
              }
            },
            {
              id: 'base1-2',
              name: 'Blastoise',
              supertype: 'Pokémon',
              number: '2',
              rarity: 'Rare Holo',
              images: {
                small: 'https://images.pokemontcg.io/base1/2.png'
              },
              tcgplayer: {
                prices: {
                  holofoil: {
                    market: 150.0
                  }
                }
              }
            },
            {
              id: 'base1-3',
              name: 'Chansey',
              supertype: 'Pokémon',
              number: '3',
              rarity: 'Rare Holo',
              images: {
                small: 'https://images.pokemontcg.io/base1/3.png'
              },
              tcgplayer: {
                prices: {
                  holofoil: {
                    market: 30.0
                  }
                }
              }
            },
            {
              id: 'base1-4',
              name: 'Charizard',
              supertype: 'Pokémon',
              number: '4',
              rarity: 'Rare Holo',
              images: {
                small: 'https://images.pokemontcg.io/base1/4.png'
              },
              tcgplayer: {
                prices: {
                  holofoil: {
                    market: 250.0
                  }
                }
              }
            },
            {
              id: 'base1-5',
              name: 'Clefairy',
              supertype: 'Pokémon',
              number: '5',
              rarity: 'Rare Holo',
              images: {
                small: 'https://images.pokemontcg.io/base1/5.png'
              },
              tcgplayer: {
                prices: {
                  holofoil: {
                    market: 25.0
                  }
                }
              }
            }
          ],
          page: 1,
          pageSize: 250,
          count: 5,
          totalCount: 102
        })
      });
    });
    
    // Catch-all for other TCG API calls
    await this.page.route('**/api.pokemontcg.io/**', async (route) => {
      console.log(`[TEST] Blocked TCG API call to: ${route.request().url()}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          count: 0,
          totalCount: 0
        })
      });
    });
  }

  /**
   * Mock all external APIs
   */
  async mockAllAPIs(): Promise<void> {
    await this.mockPokeAPI();
    await this.mockTCGAPI();
  }

  /**
   * Allow real API calls (for specific tests that need them)
   */
  async allowRealAPIs(): Promise<void> {
    await this.page.unroute('**/pokeapi.co/**');
    await this.page.unroute('**/api.pokemontcg.io/**');
  }
}