const WORD_IMAGE_GROUPS={
  activities:"clean cry eat giggle hike hop hug jump kiss laugh nap play run sing skate sleep swim yoga",
  animals:"animal ant bat bear bee bird bison buffalo bug bull bumblebee bunny butterfly camel cat caterpillar chick chicken chipmunk cow crab crocodile deer dinosaur dog dolphin dove duck duckling eagle elephant fish flamingo fly fox frog giraffe goat goldfish gorilla hamster hawk hedgehog hen hippo horse kangaroo kitten koala ladybug lamb leopard lion lizard lobster monkey moth mouse octopus otter owl panda parrot peacock penguin pig pony pup puppy rabbit raccoon rat reindeer rhino rooster salmon seal shark sheep sloth snail snake sparrow spider squid squirrel swan tiger toad turkey turtle unicorn whale wolf worm zebra",
  arts:"guitar jazz movie song violin",
  body:"arm body ear eye face feet finger foot hair hand leg lip mouth nose teeth toe tooth",
  celebrations:"birthday fireworks gift holiday party treasure wedding",
  clothing:"cap coat dress glove hat jacket mask pocket scarf shirt shoe slipper sock sweater tie",
  colors:"arrow balloon black blue bow brown circle crescent crown cube diamond dot flag gem gold green heart octagon orange pink plus purple red ribbon ring round sparkle square triangle violet white yellow",
  fantasy:"dragon ghost magic monster",
  feelings:"angry dream excited funny happy joy love luck sad silly sleepy smile wish",
  food:"apple avocado bacon bagel banana bean berry blueberry bread broccoli bun burrito butter cabbage cake candy carrot cereal cheese cherry chocolate coconut coffee cola cookie corn cream croissant cucumber cupcake dessert dinner donut drink dumpling egg eggplant fruit garlic grape gum ham hamburger honey hotdog jam juice kiwi lemon lettuce lollipop mango meat melon milk muffin mushroom noodles nut oat olive omelet onion pancake pasta peach peanut pear pepper pie pineapple pizza popcorn potato pretzel pudding pumpkin rice salad salt sandwich sausage soup spaghetti steak strawberry sweet taco tea toast tomato waffle watermelon yam yogurt",
  home:"basket bed bowl box bucket candle cup dish door fan fork lamp oven pan pillow pot rug sofa sponge teapot toilet tub window",
  nature:"autumn bamboo beach blossom cactus cave cloud clover daisy day desert fire flower fog forest garden glacier grass hill ice island jungle lake lava leaf lightning log maple meadow mist moon mountain mud nest night ocean palm petal pine plant pond rain rainbow rainforest river rock rose sand sea seashell seed shell sky snow snowflake spring sprout star stone storm summer sun sunflower sunrise sunset sunshine thunder tornado tree tulip valley volcano water waterfall wave weather wet wheat wind wing winter",
  objects:"ball bone feather hammer hole jigsaw key kite ladder lantern lock magnet mailbox mirror money net number phone picnic radio shadow snowman soccer spoon tent top torch tower toy umbrella wand watch web zip",
  other:"yes",
  people:"angel chef clown cowboy dad dentist doctor fairy family farmer friend hero kid king mermaid mom nurse pilot pirate princess queen sailor sister witch wizard woman",
  places:"bakery bridge castle cinema circus farm gym home house kitchen park school stadium town tunnel village zoo",
  school:"abacus alphabet art backpack bag bell book brain calendar camera chair class classroom clip clock color compass computer concert crayon dance dancer draw drum exam globe graduate homework keyboard learn lesson library lunch lunchbox map marker math medal microscope museum music note notebook page paint paintbrush painter painting paper pen pencil piano pin playground puzzle quiz read reading ruler science scissors singer smart sport story student teacher test think trophy trumpet write",
  space:"alien asteroid astronaut comet cosmos dark earth eclipse fuel galaxy jupiter light mars meteor midnight moonlight nebula orbit planet robot satellite saturn shuttle solar space starship telescope ufo universe",
  transport:"airplane ambulance anchor bicycle bike boat bus cab canoe car cart crane ferry firetruck helicopter helmet jeep jet kayak metro minibus monorail motorcycle plane rickshaw road rocket rowboat sailboat scooter ship skateboard sled spaceship speedboat subway taxi ticket tractor train tram trolley truck van yacht"
};
const WORD_IMAGES={};
Object.entries(WORD_IMAGE_GROUPS).forEach(([category,words])=>{
  words.split(' ').forEach(word=>{WORD_IMAGES[word]='assets/words/'+category+'/'+word+'.svg'});
});
