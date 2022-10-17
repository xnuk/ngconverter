interface InitOutput {
	readonly memory: WebAssembly.Memory
	readonly convert: (
		rsp: number,
		file: number,
		fileLen: number,
		keymap: number,
		keymapLen: number,
	) => void
	readonly __wbindgen_add_to_stack_pointer: (a: number) => number
	readonly __wbindgen_malloc: (a: number) => number
	readonly __wbindgen_free: (a: number, b: number) => void
}

interface Wasm {
	exports: InitOutput
	module: WebAssembly.Module
}

const helper = <T>(
	cons: new (buffer: ArrayBuffer | SharedArrayBuffer) => T,
) => {
	let cached = null as T | null

	return (exports: InitOutput): T => {
		cached ??= new cons(exports.memory.buffer)
		return cached
	}
}

const u8 = helper(Uint8Array)
const i32 = helper(Int32Array)

const alloc = (exports: InitOutput, arg: Uint8Array): number => {
	const ptr = exports.__wbindgen_malloc(arg.length)
	u8(exports).set(arg, ptr)
	return ptr
}

const free = (exports: InitOutput, offset: number, size: number) =>
	exports.__wbindgen_free(offset, size)

const rsp = (exports: InitOutput, diff: number): number =>
	exports.__wbindgen_add_to_stack_pointer(diff)

export const convert = (
	wasm: Wasm,
	file: Uint8Array,
	keymap: Uint8Array,
): Uint8Array => {
	const { exports } = wasm

	try {
		const retptr = rsp(exports, -16)

		const filePtr = alloc(exports, file)
		const keymapPtr = alloc(exports, keymap)

		exports.convert(retptr, filePtr, file.length, keymapPtr, keymap.length)

		const i32view = i32(exports)
		const r4 = retptr / 4

		const offset = i32view[r4 + 0]
		const size = i32view[r4 + 1]

		const ret = u8(exports)
			.subarray(offset, offset + size)
			.slice()
		free(exports, offset, size)

		return ret
	} finally {
		rsp(exports, 16)
	}
}

export const getWasm = async (
	input: Response | Promise<Response>,
): Promise<Wasm> => {
	const { instance, module } = await WebAssembly.instantiateStreaming(
		input,
		{},
	)

	const exports = instance.exports as unknown as InitOutput

	return { exports, module }
}
