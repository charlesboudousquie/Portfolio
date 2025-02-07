# Portfolio

# Lux Cymex
This repository contains the 3d Game Editor I created to help with the development of our 
Junior Year custom engine game Lux Cymex at Digipen Institute of Technology.
The repository also contains the actual game which is a 3D Light Combination Puzzle Survival Game.
The game is centered around the player solving puzzles with different light cominations that can affect the
physics and properties of objects.

The game is located inside the folder LuxCymex. Double click the ProjectAbyss.exe file to launch the game.

![Lux Cymex GIF](LuxCymex/demonstration.gif)
![Lux Cymex PIC1](LuxCymex/floating_object.png)
![Lux Cymex PIC2](LuxCymex/many_lights.png)
![Lux Cymex PIC3](LuxCymex/highlighted_objects.png)


Features of the editor include:
  
  *Level Loading/Saving  
  *Game object creation, deletion, and multi selection  
  *3D gizmo that allows for object translation, rotation and scaling  
  *Game object prefabs  
  *Undo Redo with history  
  *Debug drawing for Bullet 3D to draw its bounding boxes (located in world options window)
  *Imgui and Imguizmo  
  *Props window (similar to Inspector window in Unity)  
  *Console window  
  *Entities window for list of objects in world  

When using Editor:
  Double click charles.exe to start up editor.
  Press space to switch between Camera mode(moving around in the world) and Imgui mode(interacting with various
  Imgui windows).
  Different windows can be moved around to various docking tabs.
  Main windows include:
      Props - Display all components of currently selected game object.
      Game View - View of scene.
      Entities - List of all game objects in same
      World Options - Various debug data and options
      Console - Displays any messages produced by engine
      Selected Objects - List of all objects selected
