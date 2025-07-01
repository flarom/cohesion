## Basic map
```json
{
    "title": "map title",
    "authors": "your name",
    "version": "1",
    "map": [
        4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ],
    "width": 22,
    "height": 16,
}
```

## Map items

- `0`: Blank space  
  Can be driven trough, shots can pass trough
- `1`: Wall  
  Can't be driven trough, shots bounce when coliding
- `2`: Breakable wall  
  Can't be driven trough, breakes and becomes `0` when shot
- `3`: Water  
  Can't be driven trough, shots can pass trough
- `4`: Player  
  Spawns the player's tank, and `0` on the spot.
  - If there's no `4` in the whole map, the first `0` will become the player's spawn
  - If there's no `4` and no `0` the game will return to the menu and display an error message.
  - If there's more than one `4` on the map, a random one will be chosen to be the spawn.
- `5`: Enemy  
  Enemy tank, with variations.
  - `5.0`: Brown tank
  - `5.1`: Ash tank
  - `5.2`: Marine tank
  - `5.3`: Yellow tank
  - `5.4`: Pink tank
  - `5.5`: Green tank
  - `5.6`: Violet tank
  - `5.7`: White tank
  - `5.8`: Black tank
  

## Tanks
| ID    | Tank   | Movement   | Bullet speed | Fire rate cooldown | Ricochets | Max bullets | Max mines | Behaviour  |
|-------|--------|------------|--------------|--------------------|-----------|-------------|-----------|------------|
| `4`   | Player | Normal     | Normal       | Controlled         | 1         | 5           | 2         | Controlled |
| `5.0` | Brown  | Stationary | Normal       | Slow               | 1         | 1           | -         | Passive    |
| `5.1` | Ash    | Slow       | Normal       | Slow               | 1         | 1           | -         | Defensive  |
| `5.2` | Marine | Slow       | Fast         | Slow               | -         | 1           | -         | Defensive  |
| `5.3` | Yellow | Normal     | Normal       | Slow               | 1         | 1           | 4         | Incautious |
| `5.4` | Pink   | Slow       | Normal       | Fast               | 1         | 3           | -         | Offensive  |
| `5.5` | Green  | Stationary | Fast         | Fast               | 2         | 2           | -         | Active     |
| `5.6` | Violet | Normal     | Normal       | Fast               | 1         | 5           | 2         | Offensive  |
| `5.7` | White  | Slow       | Normal       | Fast               | 1         | 5           | 2         | Offensive  |
| `5.8` | Black  | Fast       | Fast         | Fast               | -         | 3           | 2         | Dynamic    |

### Notes

- The yellow tank rapidly deploys mines compared to other mine-deploying tanks.

- The green tank, unlike all other enemy tanks, uses calculated predictive aiming and tends to fire where the player is approaching rather than their current position, able to do so with such calculation accounting for its 2 ricochets.

- The white tank has a special property that it turns invisible as the mission begins. Its tracks remain visible.