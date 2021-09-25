import math
import sys

# These will need to be changed when we get the actual values from the game
# total amount of moves called this will eventually be huge might need to change it or mod it but will work for what we need right now
total = 0
RowCountA = 0
RowCountB = 0
RowCountC = 0
RowCountD = 0
# gets the percentage for each move that is called
moveA = 0
moveB = 0
moveC = 0
moveD = 0
statsA = 0
statsB = 0
statsC = 0
statsD = 0
# basically what we want to do is moveA,B,C,D/totalmovesUsed = stats for each move, and from there we will use the computer to compare the stats
# to decide what move to use to counter them or if they should use a health effect
# so once we get the stats for the total used we can start to see patterns in certain play styles that will allow the bot to counter them
# using some basic ideologys like water > fire > grass

# This will be changed to what the number 0 move is so normal
if moveA == 1:
    # can change this if you want using it to check amount of times used in a row
    RowCountB = 0
    RowCountC = 0
    RowCountD = 0

    moveA = moveA + 1
    total = total + 1
    statsA = moveA/total
    RowCountA = RowCountA + 1

elif moveB == 1:
    # can change this if you want using it to check amount of times used in a row
    RowCountA = 0
    RowCountC = 0
    RowCountD = 0
    #---------------
    moveB = moveB + 1
    total = total + 1
    statsB = moveB/total
    RowCountB = RowCountB + 1

elif moveC == 1:
    # can change this if you want using it to check amount of times used in a row
    RowCountA = 0
    RowCountB = 0
    RowCountD = 0

    moveC == moveC + 1
    total = total + 1
    statsC = moveC/total
    RowCountC = RowCountC + 1

elif moveD == 1:
    # can change this if you want using it to check amount of times used in a row
    RowCountA = 0
    RowCountB = 0
    RowCountC = 0

    moveD = moveD + 1
    total = total + 1
    statsD = moveD/total
    RowCountD = RowCountD + 1

# move chooser math
if statsA > statsB && statsA > statsC && statsA > statsD:
    if health < 50
        # use healing item if there are any
    # otherwise
    # pick the counter move to Move A
    # this is a place holder until i figure out what to use to call move A
    moveA = 1
