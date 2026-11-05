import sys; sys.stdout.reconfigure(encoding="utf-8")
"""Pulls the infobox weight fields for the breeds in BREEDS from the English Wikipedia API and prints them for review.
Run: python wiki_weights.py > weights_raw.txt   (output is reviewed by hand before breeds.json is written)"""
import json, re, sys, urllib.request, urllib.parse
BREEDS = ['Labrador Retriever','French Bulldog','Golden Retriever','German Shepherd','Standard Poodle','Miniature Poodle','Toy Poodle','Dachshund','Bulldog','Beagle','Rottweiler','German Shorthaired Pointer','Pembroke Welsh Corgi','Cardigan Welsh Corgi','Australian Shepherd','Yorkshire Terrier','Boxer (dog)','Cavalier King Charles Spaniel','Dobermann','Great Dane','Miniature Schnauzer','Standard Schnauzer','Giant Schnauzer','Siberian Husky','Bernese Mountain Dog','Cane Corso','Shih Tzu','Boston Terrier','Pomeranian (dog)','Havanese dog','English Springer Spaniel','Shetland Sheepdog','Brittany (dog)','American Cocker Spaniel','English Cocker Spaniel','Border Collie','Vizsla','Pug','Basset Hound','Mastiff','Chihuahua (dog breed)','Rough Collie','Maltese dog','Weimaraner','Newfoundland dog','Rhodesian Ridgeback','West Highland White Terrier','Shiba Inu','Bichon Frisé','Akita (dog)','Papillon (dog)','St. Bernard (dog)','Bloodhound','Bullmastiff','Samoyed (dog)','Portuguese Water Dog','Belgian Malinois','Great Pyrenees','Alaskan Malamute','Australian Cattle Dog','Whippet','Greyhound','Irish Wolfhound','Chow Chow','Dalmatian (dog)','Jack Russell Terrier','Staffordshire Bull Terrier','American Staffordshire Terrier','American Pit Bull Terrier','Italian Greyhound','Miniature Pinscher','Lhasa Apso','Cairn Terrier','Scottish Terrier','Airedale Terrier','Irish Setter','English Setter','Pointer (dog breed)','Goldendoodle','Labradoodle','Shar Pei','Pekingese','Keeshond','Leonberger','Tibetan Mastiff','Neapolitan Mastiff','Dogue de Bordeaux','Old English Sheepdog','Soft-coated Wheaten Terrier','Miniature American Shepherd','Boerboel','Alaskan Klee Kai','Chesapeake Bay Retriever','Nova Scotia Duck Tolling Retriever','Border Terrier','Basenji','Bull Terrier','Great Swiss Mountain Dog','Anatolian Shepherd Dog','Irish Terrier','Coton de Tuléar','Japanese Chin','Brussels Griffon','Spinone Italiano','Rat Terrier','Cockapoo','Cavapoo','Puggle','Pitsky']
OUT = {}
for i in range(0, len(BREEDS), 40):
    chunk = BREEDS[i:i + 40]
    url = 'https://en.wikipedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'prop': 'revisions', 'rvprop': 'content', 'rvslots': 'main', 'format': 'json', 'redirects': 1, 'titles': '|'.join(chunk), 'formatversion': 2})
    req = urllib.request.Request(url, headers={'User-Agent': 'CalcThisResearch/1.0 (yariv.be1@gmail.com)'})
    d = json.load(urllib.request.urlopen(req))
    for p in d['query']['pages']:
        t = p.get('revisions', [{}])[0].get('slots', {}).get('main', {}).get('content', '') if 'revisions' in p else ''
        lines = [l.strip() for l in t.split('\n') if re.match(r'\|\s*(weight|maleweight|femaleweight|male_weight|female_weight|weight_male|weight_female)\b', l.strip(), re.I)]
        OUT[p['title']] = lines[:6]
for b in BREEDS:
    pass
for k, v in OUT.items():
    print(k, '=>', ' ;; '.join(v))
missing = [b for b in BREEDS if not any(b.lower() == k.lower() for k in OUT)]
print('REQUESTED', len(BREEDS), 'GOT', len(OUT))
