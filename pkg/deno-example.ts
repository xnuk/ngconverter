import { convert, getWasm } from './ngconverter.ts'

const wasm = await getWasm(
	Deno.readFile('./ngconverter.wasm').then(
		v =>
			new Response(v, {
				headers: { 'content-type': 'application/wasm' },
			}),
	),
)

console.log(
	new TextDecoder().decode(
		convert(
			wasm,
			await Deno.readFile('../신세벌식 P2.xml'),
			new Uint8Array(),
		),
	),
)
