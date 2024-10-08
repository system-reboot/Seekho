import torch
from pydub import AudioSegment
import os
from transcriptor import transcriptor
from dotenv import load_dotenv
from translator import language_code,translate
from voiceover import voice_generator
from moviepy.editor import concatenate_audioclips, AudioFileClip
from pydub.playback import play
import shutil
import base64
from silero_vad import load_silero_vad, read_audio, get_speech_timestamps
model = load_silero_vad()
load_dotenv()

# solving https error in torch hub less than 1.9
# torch.hub._validate_not_a_forked_repo=lambda a,b,c: True

# # load the silerio vad model
# model, utils = torch.hub.load(repo_or_dir='snakers4/silero-vad',
#                               model='silero_vad',
#                               force_reload=False,
#                               onnx=False) 

# # get the helper functions out of util
# (get_speech_timestamps,
#  save_audio,
#  read_audio,
#  VADIterator,
#  collect_chunks) = utils

def silence_adder( audio_in_file,audio_out_file,silence_time):
    # for adding silence at front
    # create given seconds of silence audio segment
    one_sec_segment = AudioSegment.silent(duration=silence_time*1000)  #duration in milliseconds
    #read wav file to an audio segment
    song = AudioSegment.from_wav(audio_in_file)
    #Add above two audio segments    
    final_song = one_sec_segment + song
    #save modified audio
    final_song.export(audio_out_file, format="wav")



def chunk_merger(audio_clip_paths, output_path):
    """Concatenates several audio files into one audio file using MoviePy
    and save it to `output_path`. Note that extension (mp3, etc.) must be added to `output_path`"""
    clips = [AudioFileClip(c) for c in audio_clip_paths]
    final_clip = concatenate_audioclips(clips)
    final_clip.write_audiofile(output_path)



def translating_audio_language_and_making_chunks(input_path,target_language_code):
    wav = read_audio(input_path, sampling_rate=16000)
    speech_timestamps = get_speech_timestamps(wav, model, sampling_rate=16000)

    # assigning variables
    z = 10   # the minimum time in seconds for a clip to cut
    k = z

    # silero gives samples, we need to divide by 16000 to get roughly the seconds
    for i in range(len(speech_timestamps)):   

        speech_timestamps[i]['start'] /= 16000
        speech_timestamps[i]['end']/= 16000

        # taking the first utterance of a word and a starting point
        if i==0:
            intervals=[(0,int(speech_timestamps[0]['start']))]

        # making intervals for splitting from 5 seconds
        if i>0 and (speech_timestamps[-1]['end']-k)>z:
            # caseI: lhs till 19, rhs from 21 
            if k< speech_timestamps[i]['start'] and k>speech_timestamps[i-1]['end']:  
                intervals.append((intervals[-1][1],k))
                k+=z
            # caseII: lhs till 21, rhs from 20 
            elif  k< speech_timestamps[i]['end']:
                j = 0
                check = False
                while True:
                    j+=1
                    k+=1 
                    if (j<10):
                        if k>speech_timestamps[i]['end']:
                            check = True
                            break
                    else:    
                        break
                intervals.append((intervals[-1][1],k))
                k+=z
        # for summing up the last few samples
        elif (speech_timestamps[-1]['end']-k)<z:
            intervals.pop(0)
            intervals.append((intervals[-1][1],speech_timestamps[-1]['end']))
            break

    # print('The intervals to cut the clips are given as: ',intervals)

    clip_intervals = []
    for x in intervals:
        dic = {}
        dic['start'] = x[0]
        dic['end'] = x[1]
        clip_intervals.append(dic)

    audio = AudioSegment.from_file(input_path)

    final_transcript = []
    # clipping the audio based on silent intervals
    for i in range(len(clip_intervals)):
            start_time = clip_intervals[i]['start']
            end_time = clip_intervals[i]['end']
            # extract the segment of the audio
            segment = audio[start_time*1000:end_time*1000]
            # Create a unique directory for storing chunks
            unique_dir = os.path.join("chunks", os.path.basename(input_path).split('.')[0] + "_chunks")
            os.makedirs(unique_dir, exist_ok=True)
            
            output_file_path = os.path.join(unique_dir, f"sample_{i}.wav")
            segment.export(output_file_path, format='wav')

        
            segment.export(output_file_path , format='wav')
            

            

            #################### to store only the first 5 clips - saving the api calls ####################
            if i>=2:
                    break
    i=0

    for x in list(os.walk(unique_dir))[0][2]:
        transcript=transcriptor(unique_dir+"\\"+x)
        final_transcript.append((clip_intervals[i],transcript))
        i+1

    translated_text = []
    audio_file_paths = []
    ii=0
    for i in final_transcript:
        temp = translate(i[1],target_language_code)

        # since the conversion is not possible for more than 500 characters, considering 400 a safer boundary
        if len(temp) <= 400:
            translated_text.append((i[0],temp))
        # if not then splitting based on the punctuation mark and taking the first part
        else:
            # note following splitting is based on hindi punctuation mark '।'
            temp = '।'.join(temp.split('।')[0:2])
            translated_text.append((i[0],temp))
        
        # path is video_audio/chunk/decision_14_18.wav
        audio_path = unique_dir+"//"+ 'sample_'+str(ii)+"_"+str(i[0]['start'])+'_'+str(i[0]['end'])+'.wav'
        audio_file_paths.append(audio_path)
        # print(translated_text[-1])
        voice_generator(translated_text[-1][1],language_code(target_language_code),to_store_audio=True,audio_path=audio_path,clips=[i[0]['start'],i[0]['end']])
        ii+=1
    ######## final parts to save the audio ########
    # merging the chunks and saving file path names according to the language
    final_path = input_path.split('/')[0] + '/'+ target_language_code + '_final_audio.wav'
    chunk_merger(audio_file_paths,final_path)

    # adding a silence in front of the audio for intro section
    silence_time = intervals[0][0]
    silence_adder(final_path,final_path,silence_time)

    # Convert the final audio file to base64
    with open(final_path, "rb") as audio_file:
        encoded_string = base64.b64encode(audio_file.read()).decode('utf-8')

    # Remove the final audio file
    os.remove(final_path)

    # Return or print the base64 string as needed
    
    shutil.rmtree(unique_dir)

    return encoded_string
    
if __name__ == "__main__":
    # file containing video and audio to be translated
    # store it in the name of course for easier navigation
    input_path = 'video_audio/decision.wav'
    target_language_code = language_code("hindi")
    translating_audio_language_and_making_chunks(input_path,target_language_code)