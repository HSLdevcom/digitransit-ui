import requests
import sys

LAMASSU_URL = 'https://api.mobidata-bw.de/sharing/gbfs'

systems = requests.get(LAMASSU_URL).json()

def print_js_like_dict(d, indentation_level=0):
    print("{")
    for key, value in d.items():
        quote_char = '' if not '-' in key else '"'
        print((indentation_level + 1)* '  ', f"{quote_char}{key}{quote_char}: ", end="")
        if isinstance(value, dict):
            print_js_like_dict(value, indentation_level+1)
        else:
            if isinstance(value, str) and not value.startswith('new'):
                print(f'"{value}"', end="")
            elif isinstance(value, bool):
                print(str(value).lower(), end="")
            else:
                print(value, end="")
        if list(d.keys())[-1] != key:
            print(",")
        else:
            print()
    print(indentation_level * '  ', "}", end="" if indentation_level > 0 else "\n")

def extract_form_factors(vehicle_types):
    form_factors = set()
    for vehicle_type in vehicle_types:
        form_factor = vehicle_type.get('form_factor')
        if form_factor is not None:
            form_factors.add(form_factor)

    return list(form_factors)

def operator_id(operator, name):
    lowercased_operator = operator.lower()

    mappings = {
        'bird ': 'bird',
        'bolt': 'bolt',
        'callabike': 'callabike',
        'deer': 'deer',
        'donkey': 'donkey',
        'lime': 'lime',
        'my-e-car': 'my-e-car',
        'nextbike': 'nextbike',
        'tier': 'tier',
        'voi': 'voi',
        'zeus': 'zeus',
        'stadtmobil': 'stadtmobil',
        'lastenvelo': 'frelo_freiburg',
    }

    for partial_operator_name in mappings.keys():
        if partial_operator_name in lowercased_operator:
            return mappings[partial_operator_name]

    if 'deutsche bahn' in lowercased_operator:
        if  'RegioRad' in name:
            return 'regiorad'
        else:
            return 'callabike'

    print(f'operator {lowercased_operator} not listed, set it to other', file=sys.stderr)

    return 'other'

networks = {}
for system in systems['systems']:
    system_id = system['id']
    
    print(system_id, file=sys.stderr)
    system_information_response = requests.get(f'{LAMASSU_URL}/{system_id}/system_information')

    if system_information_response.status_code >= 400:
        print(f'Ignoring {system_id}, as response status was {system_information_response.status_code}', file=sys.stderr)
        continue

    system_information = system_information_response.json()['data']

    vehicle_types_response = requests.get(f'{LAMASSU_URL}/{system_id}/vehicle_types')
    if vehicle_types_response.status_code >= 400:
        print(f'No vehicle types for  {system_id}, assuming bicycle', file=sys.stderr)
        form_factors = ['bicycle']
    else:
        vehicle_types = vehicle_types_response.json()['data']['vehicle_types']
        form_factors = extract_form_factors(vehicle_types)
        if len(form_factors) == 0:
            print(f'No formFactors for {system_id}, assuming bicycle', file=sys.stderr)
            form_factors = ['bicycle']

    system_config = {
        'icon': f"brand_{operator_id(system_information['operator'], system_information['name'])}", # colors will be provided via css, symbol via appended formfactor
        'operator': operator_id(system_information['operator'], system_information['name']),
        'name': {
            'de': system_information['name'],
            'en': system_information['name'],
        },
        'type': 'citybike' if form_factors[0] == 'bicycle' else form_factors[0], # TODO citybike should be renamed
        'form_factors': form_factors,
        # 'visibleInSettingsUi': True, currently not checked in code. Probably lost during upstream merge. Intention: Show e.g. Taxi, but don't allow routing
        'hideCode': True,
        'enabled': True,
        #season': {
        #    'start': 'new Date(new Date().getFullYear(), 0, 1)',
        #    'end': 'new Date(new Date().getFullYear(), 11, 31)',
        # },
    }

    if 'url' in system_information:
        system_config['url'] = {
            'de': system_information['url'],
        }    

    networks[system_id] = system_config
    
print_js_like_dict(networks)
